const {Sequelize} = require('sequelize');
//import Sequelize from 'sequelize';

/* const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    }
) */

const sequelize = () => {
    try{
        return new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                dialect: 'postgres',
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
            }
        )
    } catch (e){
        console.log(e);
        setTimeout(sequelize(), 3000);
    }
}


module.exports = sequelize();