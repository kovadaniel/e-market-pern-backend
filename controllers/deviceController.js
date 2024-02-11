const ApiError = require("../error/ApiError");
const { Device, DeviceInfo } = require("../models/models");

// generates unique ids
const uuid = require('uuid');

const path = require('path');

class DeviceController {
    async create(req, res, next) {
        try{
            let {name, price, brandId, typeId, info} = req.body;

            const {img} = req.files;
            let fileName = name.replace(/ /g,"-") + '-' + uuid.v4() + '.jpg';
            // move the given image to the directory named 'static'
            img.mv(path.resolve(__dirname, '..', 'static', fileName));
    
            const device = await Device.create({name, price, brandId, typeId, img:fileName})

            // if we have `info` (it is a JSON-string like '{"size": 42, "volume": 30}'), 
            // for each its key we create a DeviceInfo in out DB
            if(info){
                console.log("info:", info);
                info = JSON.parse(info);
                info.forEach(i => {
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id,
                })})
            }

            res.json({device})
        } catch(e){
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try{
            let {brandId, typeId, page, limit} = req.query;
            page = page || 1;
            limit = limit || 9;
            let offset = limit * page - limit;
            let devices;
            if(!brandId && !typeId){
                devices = await Device.findAndCountAll({limit, offset});
            } else if(brandId && !typeId){
                devices = await Device.findAndCountAll({where: {brandId}, limit, offset});
            } else if(!brandId && typeId){
                devices = await Device.findAndCountAll({where: {typeId}, limit, offset});
            } else if(brandId && typeId){
                devices = await Device.findAndCountAll({where: {typeId, brandId}, limit, offset});
            }
            
            res.json(devices);
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async getOne(req, res) {
        try{
            // req.params a.e. [id] is taken from '/api/device/:id
            const {id} = req.params;
            const device = await Device.findOne({
                where: {id},
                // in addition, load all the characteristics related to this device
                // 'info' is the name of the field to be included to the returned
                // device object
                include: [{model: DeviceInfo, as: 'info'}]
            })
            return res.json(device);
        } catch(e){
            next(ApiError.databaseError(e.message))
        }
    }

    async delete(req, res, next){
        // Device can be deleted only by an ADMIN
        const {id} = req.params;

        if(!id) {
            return next(ApiError.internal('Device ID was not provided'));
        }
        const candidateDevice = await Device.findOne({where: {id}});
        if(!candidateDevice){
            return next(ApiError.internal('Device with this ID does not exist'))
        }

        await candidateDevice.destroy();
        return res.json({message: `Device with ID ${id} has been deleted`})
    }
}

module.exports = new DeviceController;