'use strict'

const { SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")
class DiscountController {
    createDiscountCode = async(req, res, next) => {
        console.log(req.body),
        new SuccessResponse({
            message: "Create discount code successfully",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllProductWithDiscountCode = async(req, res, next) => {
        new SuccessResponse({
            message: "Get all product discount codes",
            metadata: await DiscountService.getAllProductWithDiscountCode({
                code : req.params.code,
                shopId: req.user.userId,
                userId: req.user.userId,
            })
        }).send(res)
    }

    getAllDiscountCodeByShopId = async(req, res, next) => {
        new SuccessResponse({
            message: "Get all discount codes",
            metadata: await DiscountService.getAllDiscountCodesByShopId({
                shopId: req.params.shopId
            })
        }).send(res)
    }
}

module.exports = new DiscountController()