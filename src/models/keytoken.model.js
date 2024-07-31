'use strict'

const {model, Schema, Types} = require("mongoose") 

const DOCUMENT_NAME = 'Key'
const CONNECTION_NAME = 'Keys'

var keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    privateKey:{
        type: String, required: true
    },
    publicKey:{
        type: String, required: true
    },
    refreshTokensUsed:{
        type: Array, default:[]
    },
    accessToken:{
        type: String, required: true
    },
},{
    collection: CONNECTION_NAME,
    timestamps: true
})

module.exports = model(DOCUMENT_NAME, keyTokenSchema)