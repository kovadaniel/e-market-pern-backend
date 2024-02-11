const jwt = require('jsonwebtoken');

/**
 * this function called without arguments returns a middleware 
 * that parses user-data from JWT token.
 * If any role is given and current user role
 * is not equales to a given role, its throws an error 
 * 
 * this middleware will be linked to any request that needs 
 * a special user role for access like POST '/api/user/device'
 */
module.exports = function(role){
    return function(req, res, next){
        if(req.method === "OPTIONS"){
            next();
        }
        try{
            const token = req.headers.authorization.split(' ')[1]; // 'JWT dsdf9sdf9sd0f'
            if(!token){
                res.status(401).json({message: 'No authorized'})
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if(role && decoded.role !== role){
                next(res.status(403).json({message: 'No access'}))
            } 

            req.user = decoded;
            next(); // calling next middleware
    
        } catch(e){  
            res.status(401).json({message: 'No authorized'})
        }
    }
}


