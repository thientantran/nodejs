'use strict'

const { BadRequestError } = require("../core/error.response")
const { findCartById } = require("../models/repo/cart.repo")
const { checkProductByServer } = require("../models/repo/product.repo")
const { getDiscountAmount } = require("./discount.service")


class CheckoutService{
    //payload from FE
    /*
     {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [],
                item_products:[
                    {
                        price,
                        quantity,
                        productId,
                    }
                ]
            },
            {
                shopId,
                shop_discounts: [],
                item_products:[
                    {
                        price,
                        quantity,
                        productId,
                    }
                ]
            }
        ]
    }
     */

    static async checkOutReview({
        cartId, userId, shop_order_ids = []
    }){
        // check cartId ton tai k?
        const foundCart = await findCartById(cartId)
        if(!foundCart){
            throw new BadRequestError("Cart not found")
        }

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        }
        const shop_order_ids_new = []

        // tinh tong tien bill
        for (let i=0; i<shop_order_ids.length; i++){
            const {shopId, shop_discounts =[], item_products =[]} = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log("checkProductServer:::", checkProductServer)
            if(!checkProductServer[0]){
                throw new BadRequestError("Order wrong")
            }
            // Ttong tien  don hang 1 shop
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.price * product.quantity
            },0)

            // tong tien don hang
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            if(shop_discounts.length>0){
                // chỗ này chỉ mới viết lấy 1 discount đàu tiền, trong trường hợp áp dụng hết discount thì sao?, hay xử lý chọn discount tốt nhất, hoặc chọn nhiều discount
                for(let j =0; j < shop_discounts.length; j++){
                    const {totalPrice = 0, discount =0} = await getDiscountAmount({
                        codeId: shop_discounts[j].codeId,
                        userId,
                        shopId,
                        products: checkProductServer
                    })
                    // tong cong discount giam gia
                    checkout_order.totalDiscount += discount
    
                    // meu tien giam gia hon 0
                    if(discount >0){
                        itemCheckout.priceApplyDiscount = checkoutPrice - discount
                    }
                }
                
            }
            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
   
}

module.exports = CheckoutService