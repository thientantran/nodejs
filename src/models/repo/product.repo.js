'use strict'

const { Types } = require("mongoose")
const { product } = require("../product.model")

const findAllDraftsForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const publishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id : new Types.ObjectId(product_id)
    })
    if(!foundShop){
        return null
    }
    foundShop.isPublished = true
    foundShop.isDraft = false
    const result = foundShop.save()
    return result
}

const unPublishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id : new Types.ObjectId(product_id)
    }).lean()
    if(!foundShop){
        return null
    }
    const result = await product.updateOne({_id: new Types.ObjectId(product_id)}, {isPublished: false, isDraft: true})
    console.log(result.modifiedCount)
    return result.modifiedCount
}

const queryProducts = async ({query, limit, skip}) => {
    return await product.find(query).
    populate('product_shop', 'name email -_id') // chỉ lấy name và email, không lấy _id từ bảng shop
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop
}