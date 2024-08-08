'use strict'

const { Schema, model } = require("mongoose")

const DOCUMENT_NAME = 'Cart'
const CONNECTION_NAME = 'Carts'

const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {type: Array, required: true, default: []},
    /**
     gửi price ở đây, nhưng check lại ở server, phòng trường hợp có kẻ gian
     [
        {
            productId: 'id',
            quantity: 1,
            shopId: 'id',
            name: 'name',
            price: 1000}
     ]
     */
    cart_count_product: {type: Number, default: 0},
    cart_userId: {type: Number,  required: true},
},{
    collection: CONNECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'ModifiedOn'
    }
})

module.exports = model(DOCUMENT_NAME, cartSchema)