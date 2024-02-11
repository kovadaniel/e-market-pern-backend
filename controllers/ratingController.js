const { Rating, User, Device } = require("../models/models");
const ApiError = require('../error/ApiError')
const {approximate} = require('../utils/utils')

async function reRateDevice(deviceId){
    const device = await Device.findOne({where: {id: deviceId}});
    const relevantRates = await Rating.findAll({where: {deviceId}});
    device.rating = approximate(relevantRates.map(rate => rate.rate));
    await device.save();
}
 /**
  * When a user creates a new rating to some device,
  * we add it to the database and call reRate() to re-evaluate
  * current rating of this device (including this new rating)
  */
class RatingController {
    async create(req, res, next) {
        try {
            const {rate, deviceId} = req.body; // as this request must be POST, it has a body
            // 1. validate given data
            if(!rate || rate < process.env.MIN_RATING || rate > process.env.MAX_RATING){
                return next(ApiError.badRequest('Wrong rate'))
            }
            const user = await User.findOne({where: {email: req.user.email}})

            // 2. check if a user have already left a rating to this device
            const candidate = await Rating.findOne({where: {userId: user.id, deviceId}});

            if(candidate){
                return next(ApiError.badRequest('User have already left a comment to this device'))
            }
            
            // 3. create a new rating
            const rating = await Rating.create({rate, userId: user.id, deviceId});

            // 4. modify Device rating with a given new rating
            await reRateDevice(deviceId);

            return res.json(rating);
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async delete(req, res, next){
        // rating can be be deleted only by an ADMIN (extra capabilities for extra cases)
        // user who created it can only change it
        try{
            const {id} = req.params;
            const candidate = await Rating.findOne({where: {id}});
            if(!candidate){
                return next(ApiError.badRequest('This rating does not exist'))
            }
            await candidate.destroy();
            return res.json({message: 'Rating has been deleted'})
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async change(req, res, next){
        try{
            const {id, rate} = req.body;

            // 1. get user data by sent token. 
            //    Fetch with it a user ID from DB.
            const user = await User.findOne({where: {email: req.user.email}});

            // 2. get information about this rating from DB
            const rating = await Rating.findOne({
                where: {id}, 
                include: [{model: Device, attributes: ["rating"]}],
            });
            if (!rating) { 
                return next(ApiError.badRequest('This rating does not exist'))
            }

            // 3. rating can be modified only by the USER who created it 
            //    or by ADMIN
            if(rating.userId !== user.id && user.role !== 'ADMIN') {
                return next(ApiError.internal('No rights'));
            }

            // 4. modify current rating information
            rating.rate = rate;
            await rating.save();

            // 5. modify Device rating with a given new rating
            await reRateDevice(rating.deviceId);

            return res.json(rating);
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async check(req, res, next){
        const {deviceId} = req.query;
        if(!deviceId){ 
            return next(ApiError.badRequest('Provide deviceId for rating check function!'))
        }
        try{
            const user = await User.findOne({where: {email: req.user.email}});
            const rating = await Rating.findOne({where: {userId: user.id, deviceId}});
            return res.json(rating);
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async get(req, res, next) {
        try{
            let {userId, deviceId} = req.query;
            let ratings;
            if(!userId && !deviceId){
                ratings = await Rating.findAndCountAll();
                //return next(ApiError.badRequest('At least one of userId and deviceId is required'))
            } else if(userId && !deviceId){
                ratings = await Rating.findAndCountAll({where: {userId}});
            } else if(!userId && deviceId){
                ratings = await Rating.findAndCountAll({where: {deviceId}});
            } else if(userId && deviceId){
                ratings = await Rating.findAndCountAll({where: {userId, deviceId}});
            }

            return res.json({ratings});
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
        
    }
}

module.exports = new RatingController;