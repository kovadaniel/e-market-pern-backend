const jwt = require('jsonwebtoken');

// !!! [deprecated]
// this middleware will be linked to the GET '/api/user/auth'
module.exports = function(req, res, next){
    if(req.method === "OPTIONS"){
        next();
    }
    try{
        const token = req.headers.authorization.split(' ')[1]; // 'Beared dsdf9sdf9sd0f'
        if(!token){
            res.status(401).json({message: 'No authorized'})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next(); // calling next middleware
 
    } catch(e){
        res.status(401).json({message: 'No authorized'})
    }
}