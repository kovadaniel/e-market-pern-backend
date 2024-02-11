require('dotenv').config();
const express = require('express');
// sequelizer for interaction with the Data Base
const sequelize = require('./db');
const models = require('./models/models.js');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const router = require('./routes/index');
const ErrorHandler = require('./middleware/ErrorHandlingMiddleware');
const path = require('path')

const PORT = process.env.PORT || 10000;

const app = express();
// middleware that makes the server accessible by other origins
const corsOptions ={
    origin:process.env.ORIGIN, 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
// middleware for parsing json files
app.use(express.json());
// middleware that enables using files in requests
app.use(fileUpload({}));
// middleware for returning files from /static folder as static files
app.use(express.static(path.resolve(__dirname, 'static')));

app.use('/api', router);

// Error handling. Should be placed at the very end of all middlewares
app.use(ErrorHandler); 

const start = async () => {
    try{
        // establises the connection to the data base
        await sequelize.authenticate();
        // compares state of the DB to our scheme of data
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.log(e);
        setTimeout(start(), 5000);
    }
}

start();
