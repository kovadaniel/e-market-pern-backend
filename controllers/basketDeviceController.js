const { BasketDevice, Basket, User } = require("../models/models");
const ApiError = require('../error/ApiError');

class BasketDeviceController {
    async add(req, res, next){
        try{
            const {deviceId} = req.body;
            if(!deviceId){
                return next(ApiError.badRequest('deviceId is not provided'))
            }

            const user = await User.findOne({where: {email: req.user.email}})
            const candidate = await BasketDevice.findOne({where: {basketId: user.basketId, deviceId}})
            let basketDevice;
            if(candidate){
                candidate.count++;
                await candidate.save();
                basketDevice = candidate;
            } else{
                basketDevice = await BasketDevice.create({basketId: user.basketId, deviceId})
            }
            return res.json(basketDevice);
        } catch(e){
            next(ApiError.databaseError(e.message));
        }
    }

    async remove(req, res, next){
        const { deviceId } = req.params;
        if(!deviceId){
            return next(ApiError.badRequest('device id is not provided'))
        }

        try{
            const user = await User.findOne({where: {email: req.user.email}})
            const basket = await Basket.findOne({where: {userId: user.id}})
            const basketDevice = await BasketDevice.findOne(
                {where: {basketId: basket.id, deviceId}
            })
            if(basketDevice){
                if(basketDevice.count > 1){
                    basketDevice.count--;
                    await basketDevice.save();
                    return res.json(basketDevice)
                } else{
                    basketDevice.destroy();
                    return res.json({message: 'basket device has been deleted'})
                }
                
            } else{
                return next(ApiError.internal('device is not in the users card'))
            }
            
        } catch(e){
            return next(ApiError.databaseError(e.message));
        }
    }

    async getAll(req, res, next) {
        const {page, limit} = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = limit * page - limit;

        let basketDevices;
        try{
            const user = await User.findOne({where: {email: req.user.email}})
            basketDevices = await BasketDevice.findAndCountAll({
                where: {basketId: user.basketId}, 
                limit, 
                offset
            });
        } catch(e){
            next(ApiError.databaseError(e.message));
        }
        return res.json(basketDevices);
    }


}

module.exports = new BasketDeviceController;