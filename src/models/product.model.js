'use strict'

const {model, Schema} = require("mongoose") 

const DOCUMENT_NAME = 'Product'
const CONNECTION_NAME = 'Products'

var productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    product_description: {
        type: String
    },
    product_quantity : {
        type: Number,
        required: true
    },
    product_type : {
        type: String,
        required: true,
        enum: ["Electronic", "Clothing", "Books", "Home & Kitchen", "Beauty & Health", "Sports & Outdoors", "Toys & Games", "Others"]
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes :{
        type: Schema.Types.Mixed,
        required: true
    }
},{
    collection: CONNECTION_NAME,
    timestamps: true
})

// define the product type = clothing
const clothingSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    size: String,
    material : String,
    product_shop : {type: Schema.Types.ObjectId, ref: 'Shop'}
},{
    collection: "Clothes",
    timestamps: true
})

// define the product type = electronics
const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
    product_shop : {type: Schema.Types.ObjectId, ref: 'Shop'}
},
{
    collection: "Electronics",
    timestamps: true
})
module.exports = {
    product : model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronic", electronicSchema),
    clothing: model("Clothing", clothingSchema)
}