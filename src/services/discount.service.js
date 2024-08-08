'use strict'

const { model } = require("mongoose")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const discountModel = require("../models/discount.model")
const { findAllDiscountCodeUnSelect, checkDiscountExists } = require("../models/repo/discount.repo")
const { findAllProduct } = require("../models/repo/product.repo")
const { convertToObjectIdMongodb } = require("../utils")
const { filter } = require("lodash")

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

    //Apply discount code for products. input là mảng products với productsid, shopid, quantity, name, price, có code nữa, và userId
    static async getDiscountAmount({codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code:codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        if(!foundDiscount){
            throw new NotFoundError("Discount code not found")
        }

        const { discount_is_active, discount_max_uses,discount_max_uses_per_user,discount_type,discount_min_order_value,  discount_value } = foundDiscount
        if(!discount_is_active){
            throw new BadRequestError("Discount code is not active")
        }
        if(!discount_max_uses){
            throw new BadRequestError("Discount code has expired")
        }

        if(new Date() < new Date(foundDiscount.discount_start_date) || new Date() > new Date(foundDiscount.discount_end_date)){
            throw new BadRequestError("Discount code has expired")
        }
        // check xem có giá trị tối thiểu không
        let totalOrder = 0
        if(discount_min_order_value > 0) {
            totalOrder = products.reduce((total, product) => {
                return total + product.price * product.quantity
            }, 0)

            if(totalOrder < discount_min_order_value){
                throw new BadRequestError(`Order value is too low, you need to spend at least ${discount_min_order_value}`)
            }
        }

        if(discount_max_uses > 0) {
            const userUsed = foundDiscount.discount_users_used.filter(user => user === userId)

            if(userUsed && userUsed.length >= discount_max_uses_per_user){
                throw new BadRequestError("You have reached the maximum number of uses")
            }
            // foundDiscount.discount_users_used.push(userId)
            // foundDiscount.discount_uses_count += 1
            // foundDiscount.discount_max_uses -= 1
            // await discountModel.findByIdAndUpdate(foundDiscount._id, foundDiscount)
            await discountModel.findOneAndUpdate(foundDiscount._id, {
                $push: {discount_users_used: userId},
                $inc: {discount_uses_count: 1, discount_max_uses: -1}
            })
        }

        // check xem type của discount
        const amount = discount_type === "fixed_amount" ? discount_value : totalOrder * discount_value / 100

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({shopId, codeId}){
        const deleted = await discountModel.findOneAndDelete({
            discount_code : codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }


    // cancle discount by user
    static async cancelDiscountCode({codeId, shopId, userId}){
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if(!foundDiscount){
            throw new NotFoundError("Discount code not found")
        }

        const result = await discountModel.findOneAndUpdate(foundDiscount._id, {
            $pull: {discount_users_used: userId},
            $inc: {discount_max_uses: 1, discount_uses_count: -1}
        })

        return result
    }
}

module.exports = DiscountService