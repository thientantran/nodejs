'use strict'

const { uniq } = require('lodash')
const {model, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Apikey'
const CONNECTION_NAME = 'Apikeys'

const apiKeySchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    permissions: {
        type: [String],
        required: true,
        default: ['0000','1111','2222']
    }
}, {
    collection: CONNECTION_NAME,
    timestamps: true
})
module.exports = model(DOCUMENT_NAME, apiKeySchema)