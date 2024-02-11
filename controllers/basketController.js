const { Basket, User, BasketDevice, Device } = require("../models/models");
const ApiError = require('../error/ApiError');

class BasketController {
    async get(req, res, next) {
        let user;
        try{
            user = await User.findOne({where: {email: req.user.email}})
        } catch(e){
            next(ApiError.databaseError(e.message));
        }
        const basket = await Basket.findOne({
            where: {userId: user.id},
            include: [{
                model: BasketDevice,
                attributes: ["count", "deviceId"],
                include: [{
                    model: Device,
                    attributes: ["img", "name", "price", "brandId", "typeId"],
                }]
                
            }],
        });
        return res.json(basket);
    }
}

module.exports = new BasketController;