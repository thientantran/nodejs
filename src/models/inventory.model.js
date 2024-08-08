'use strict'

const {model, Schema, Types} = require("mongoose")
const DOCUMENT_NAME = 'Inventory'
const CONNECTION_NAME = 'Inventories'

const invotorySchema = new Schema({
    inven_productId : {type: Schema.Types.ObjectId, ref: 'Product'},
    inven_location: {type: String, default: "unknown"},
    inven_stock : {type: Number, required: true},
    inven_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    inven_reservations: {type: Array, default: []},
},{
    timestamps: true,
    collection: CONNECTION_NAME
})

module.exports ={inventory: model(DOCUMENT_NAME, invotorySchema)}