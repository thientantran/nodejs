require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const {default:helmet} = require('helmet');
const compression = require('compression');
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// init middleware
app.use(morgan('dev')); //dev, combine, common, short, tiny, 
app.use(helmet())
app.use(compression())
// init db
require("./dbs/init.mongodb")
// const {checkOverLoad} = require("./helpers/check.connect")
// checkOverLoad()
// routes
app.use("/", require("./routes"))
// handling error


module.exports = app;