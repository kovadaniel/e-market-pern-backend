const { Brand, TypeBrand, Type } = require("../models/models");
const ApiError = require('../error/ApiError')

class BrandController {
    async create(req, res, next) {
        try{
            const {name, typeId} = req.body; // as this request must be POST, it has a body
            const brand = await Brand.create({name});
            if (typeId){
                const brandType = await TypeBrand.create({brandId: brand.id, typeId}) 
            }
            return res.json({brand});
        } catch(e){
            return next(ApiError.databaseError(e.message));
        }
    }

    async getAll(req, res) {
        const brands = await Brand.findAll({
            include: [{
                model: Type,
                attributes: ["id"],
                through: {
                    attributes: []
                },
            }],
        });
        const parsedBrands = JSON.parse(JSON.stringify(brands))
        const brandsResponse = parsedBrands.map(b => ({...b, types: b.types.map(t => t.id) }))
        return res.json(brandsResponse);
    }

    async delete(req, res, next){
        //brand can be be deleted only by an ADMIN 
        const {id} = req.params;

        if(!id) {
            return next(ApiError.internal('Brand ID was not given'));
        }
        const candidateBrand = await Brand.findOne({where: {id}});
        if(!candidateBrand){
            return next(ApiError.internal('Brand with this id does not exist'))
        }

        await candidateBrand.destroy();
        return res.json({message: 'Brand has been deleted'})
    }
}

module.exports = new BrandController;