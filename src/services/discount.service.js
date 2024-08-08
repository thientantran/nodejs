'use strict'

const { BadRequestError } = require("../core/error.response")
const discountModel = require("../models/discount.model")
const { findAllDiscountCodeUnSelect } = require("../models/repo/discount.repo")
const { findAllProduct } = require("../models/repo/product.repo")
const { convertToObjectIdMongodb } = require("../utils")

class DiscountService{
    /**
     Discount services
     1 - Generate discount code [Shop | Admin]
     2 - Get disciunt amount [User] 
     3 - AGet all product discount codes [User | Shop]
     4 - Verify discount code [User]
     5 - Delete discount code [Admin | Shop]
     6 - Cancle discount code [User]
     */
    static async createDiscountCode (payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids,applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user
        } = payload
        // check
        if(new Date () < new Date(start_date) || new Date() > new Date(end_date)){
            throw new BadRequestError("Discount code has expired")
        }
        if(new Date(start_date) > new Date(end_date)){
            throw new BadRequestError("Invalid date range")
        }

        // create discount code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError("Discount code already exists")
        }

        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids
        })
        return newDiscount
    }

    // update discount code -> tự viết
    static async updateDiscountCode(){
        return "Tự viết đi bà già"
    }
    
    // Get list product available by discount code
    static async getAllProductWithDiscountCode({code, shopId, userId, limit, page}){
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId),
        }).lean()

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new BadRequestError("Discount code not found")
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount
        let products 
        if(discount_applies_to === "all"){
            products = await findAllProduct({
                filter:{
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ['product_name']
            })
        }
        if(discount_applies_to === "specific"){
            products = await findAllProduct({
                filter:{
                    _id :{$in: discount_product_ids},
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ['product_name']
            })
        }
        return products
    }

    // Get all discount code of shop by shopId
    static async getAllDiscountCodesByShopId({limit, page, shopId}){
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ["__v"],
            model: discountModel
        })
        return discounts
    }
}

module.exports = DiscountService