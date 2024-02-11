const {Type, Brand} = require('../models/models')
const ApiError = require('../error/ApiError')

class TypeController {
    async create(req, res) {
        try{
            const {name} = req.body; // as this request must be POST, it has a body
            const type = await Type.create({name});
            return res.json({type});
        } catch(e){
            return next(ApiError.databaseError(e.message));
        }
    }

    async getAll(req, res) {
        //const types = await Type.findAll();
        //return res.json(types);

        const types = await Type.findAll({
            include: [{
                model: Brand,
                attributes: ["id"],
                through: {
                    attributes: []
                },
            }],
        });
        const parsedTypes = JSON.parse(JSON.stringify(types))
        const typesResponse = parsedTypes.map(t => ({...t, brands: t.brands.map(b => b.id)}))
        return res.json(typesResponse);
    }

    async delete(req, res, next){
        // type can be deleted only by an ADMIN
        const {id} = req.params;

        if(!id) {
            next(ApiError.internal('Type ID was not provided'));
        }
        
        let candidateType;
        try{
            candidateType = await Type.findOne({where: {id}});
        } catch(e){
            return next(ApiError.databaseError(e.message))
        }
        if(!candidateType){
            return next(ApiError.internal('Type with this ID does not exist'))
        }

        await candidateType.destroy();
        return res.json({message: 'Type has been deleted'})
    }
}

module.exports = new TypeController;