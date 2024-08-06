'use strict'

const {model, Schema} = require("mongoose") 
const { default: slugify } = require("slugify")

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
        enum: ["Electronic", "Clothing", "Books", "Home & Kitchen", "Beauty & Health", "Sports & Outdoors", "Toys & Games", "Furniture", "Others"]
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes :{
        type: Schema.Types.Mixed,
        required: true
    },
    // thêm 1 số thông tin mới
    product_slug: String,
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // làm tròn số 4,34444 -> 4.3
    },
    product_variation: {type: Array, default: []},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: {type: Boolean, default: false, index: true, select: false},
},{
    collection: CONNECTION_NAME,
    timestamps: true
})

// create index for search
productSchema.index({product_name: 'text', product_description: 'text'})
//set up a text index in MongoDB using Mongoose, you can perform full-text searches using the $text operator. However, the $text operator searches for whole words and does not support partial matches or regular expressions directly. This is why searching for "N" might not return "New Jeans", but searching for "New" will.
//https://anonystick.com/blog-developer/full-text-search-mongodb-chi-mot-bai-viet-khong-can-nhieu-2022012063033379
//Document middleware
productSchema.pre('save', function(next){
    // this.product_slug = this.product_name.toLowerCase().split(' ').join('-')
    this.product_slug = slugify(this.product_name, {lower: true})
    next()
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

const furnitureSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
    product_shop : {type: Schema.Types.ObjectId, ref: 'Shop'}
},
{
    collection: "Furnitures",
    timestamps: true
})
module.exports = {
    product : model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronic", electronicSchema),
    clothing: model("Clothing", clothingSchema),
    furniture: model("Furniture", furnitureSchema)
}