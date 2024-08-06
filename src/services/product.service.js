'use strict'

const { BadRequestError } = require("../core/error.response")
const {product, clothing, electronic, furniture} = require("../models/product.model")
const { findAllDraftsForShop } = require("../models/repo/product.repo")

// define Factory class to create product
class ProductFactory {

    static productRegistry = {} // key-class
    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass){
            throw new BadRequestError(`Invalid product type ${type}`)
        }
        return new productClass(payload).createProduct()
        
        // switch(type){
        //     case "Clothing":
        //         return new Clothing(payload).createProduct()
        //     case "Electronic":
        //         return new Electronic(payload).createProduct()
        //     case "Furniture":
        //         return new Furniture(payload).createProduct()    
        //     default:
        //         throw new BadRequestError(`Invalid product type ${type}`)
        // }
    }

    //query 
    static async findAllDraftsForShop({product_shop, limit =50, skip=0}){
        const query = {product_shop, isDraft: true}
        return await findAllDraftsForShop({query, limit, skip})
    }
}

// define base product class
class Product{
    constructor({product_name, product_thumb, product_price, product_description, product_quantity, product_type, product_shop, product_attributes}){
        
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_price = product_price
        this.product_description = product_description
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // create new product
    async createProduct(product_id){ // để dùng id chung với các sub-class
        return await product.create({...this, _id : product_id})
    }
}

// Define sub-class for differant product types Clothing
class Clothing extends Product {
    async createProduct(){
        const newClothing = await clothing.create({...this.product_attributes, product_shop: this.product_shop})
        if(!newClothing){
            throw new BadRequestError("Failed to create new clothing product")
        }

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct){
            throw new BadRequestError("Failed to create new product")
        }
        return newProduct
    }
}

// Define sub-class for differant product types Electronic
class Electronic extends Product {
    async createProduct(){
        const newElectronic = await electronic.create({...this.product_attributes, product_shop: this.product_shop})
        if(!newElectronic){
            throw new BadRequestError("Failed to create new electronic product")
        }

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct){
            throw new BadRequestError("Failed to create new product")
        }
        return newProduct
    }
}

//Define sub-class for differant product types Furniture
class Furniture extends Product {
    async createProduct(){
        const newFurniture = await furniture.create({...this.product_attributes, product_shop: this.product_shop})
        if(!newFurniture){
            throw new BadRequestError("Failed to create new furniture product")
        }

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct){
            throw new BadRequestError("Failed to create new product")
        }
        return newProduct
    }
}


// register product type
ProductFactory.registerProductType("Clothing", Clothing)
ProductFactory.registerProductType("Electronic", Electronic)
ProductFactory.registerProductType("Furniture", Furniture)

module.exports = ProductFactory