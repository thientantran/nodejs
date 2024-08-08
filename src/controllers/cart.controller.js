'use strict'

const { SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {
    addToCart = async(req, res, next) => {
        new SuccessResponse({
            message: "create new cart successfully",
            metadata: await CartService.addToCart({...req.body})
        }).send(res)
    }

    //update + -
    update = async(req, res, next) => {
        new SuccessResponse({
            message: "update cart successfully",
            metadata: await CartService.addToCartV2({...req.body})
        }).send(res)
    }

    // delete
    delete = async(req, res, next) => {
        new SuccessResponse({
            message: "delete cart successfully",
            metadata: await CartService.deleteProductUserCart({...req.body})
        }).send(res)
    }

    //list
    listToCart = async(req, res, next) => {
        new SuccessResponse({
            message: "list cart successfully",
            metadata: await CartService.getListUserCart(req.query.userId)
        }).send(res)
    }
}

module.exports = new CartController()