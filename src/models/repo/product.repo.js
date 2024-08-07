'use strict'

const { Types } = require("mongoose")
const { product } = require("../product.model")
const { getSelectData, unGetSelectData } = require("../../utils")

const findAllDraftsForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const searchProductsByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch)
    // bỏ tìm full projects, mình sẽ có 1 service để tìm riêng
    const results = await product.find({
        $text: {$search: regexSearch},
        isPublished: true
    }, {score: {$meta: 'textScore'}})
    .sort({score: {$meta: 'textScore'}})
    .lean()
    return results
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

const findAllProduct = async ({limit, sort, page, filter, select}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime'? {_id: -1} : {_id: -1}
    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select)) // chuyển từ mang ['name', 'price'] sang object {name: 1, price: 1}
    .lean()
    return products
}

const findProduct = async ({product_id, unSelect}) => {
    return  await product.findById(product_id).select(unGetSelectData(unSelect)).lean() // chuyển từ mang ['name', 'price'] sang object {name: 0, price: 0}
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
    unPublishProductByShop,
    searchProductsByUser,
    findAllProduct,
    findProduct
}