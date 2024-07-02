'use strict'

const mongoose = require('mongoose')

const connectString = 'mongodb://localhost:27017/shopDEV'

mongoose.connect(connectString).then( _ => {
    console.log('Connected to MongoDB')
    }).catch( err => {
    console.error('Error connecting to MongoDB', err)
    }
)

//dev

if (1 === 1) {
    mongoose.set('debug', true)
    mongoose.set('debug', {color:true})
}

module.exports = mongoose