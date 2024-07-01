const express = require('express');
const morgan = require('morgan');
const {default:helmet} = require('helmet');
const compression = require('compression');
const app = express()

// init middleware
app.use(morgan('dev')); //dev, combine, common, short, tiny, 
app.use(helmet())
app.use(compression())
// init db

// routes
app.get("/", (req, res, next) => {
    const strCompress = "Hello World"
    return res.status(200).json({ message: "Hello World" , metadata: strCompress.repeat(100000)});
})
// handling error


module.exports = app;