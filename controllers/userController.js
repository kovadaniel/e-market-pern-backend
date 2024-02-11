const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Basket } = require('../models/models');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role}, // payload
        process.env.SECRET_KEY, // secret key
        {expiresIn: '24h'}, // options
    )
}

class UserController {
    async registration(req, res, next) {
        try{
            const {email, password, role} = req.body;
            
            if(!email || !password){
                return next(ApiError.badRequest('email and password are required'))
            }

            // check if we have someone with the same email already registered
            const candidate = await User.findOne({where: {email}});
            if(candidate){
                return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
            }

            // '5' is the amount of hashes over the password
            const hashPassword = await bcrypt.hash(password, 5)

            const user = await User.create({
                email,
                role,
                password: hashPassword
            });
            const basket = await Basket.create({userId: user.id});
            user.basketId = basket.id;
            user.save();
            const token = generateJwt(user.id, user.email, user.role)
            return res.json({token});

        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async login(req, res, next) {
        try{
            const {email, password} = req.body;
            const user = await User.findOne({where: {email}})
            if(!user){
                return next(ApiError.internal("Пользователя с таким логином не существует"))
            }
    
            let comparePassword = bcrypt.compareSync(password, user.password);
            if(!comparePassword){
                return next(ApiError.internal("Неверный пароль"))
            }
            const token = generateJwt(user.id, user.email, user.role);
    
            return res.json({token})
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
        
    }

    async check(req, res) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }

    async delete(req, res, next){
        /**
         * in order to delete an account USER have to be logged in (having a token) 
         * and send it in Authorization header.
         * USER can delete only its own accout. ADMIN can delete any account.
         */

        try{
            // email (login) of the user we are to delete
            const {email} = req.body;
            if(req.user.email !== email && req.user.role !== 'ADMIN'){
                return next(ApiError.badRequest('Нет доступа'))
            }
            
            const candidate = await User.findOne({where: {email}});
            if(!candidate){
                return next(ApiError.internal("Пользователя с таким логином не существует"))
            }

            const basket = await Basket.findOne({where: {userId: candidate.id}});
            
            await candidate.destroy();
            await basket.destroy();

            return res.json({message: 'Пользователь был удалён'}) // user with his basket has been deleted

        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }
}

module.exports = new UserController;