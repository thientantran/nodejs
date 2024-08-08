'use strict'

const { NotFoundError } = require("../core/error.response")
const cartModel = require("../models/cart.model")
const { getProductById } = require("../models/repo/product.repo")

// nên tạo giỏ hàng khi user được tạo, có nghĩa 1 user lun có 1 giỏ hàng
/**
 key features:
 - add product to cart
 - reduce product quantity by one
 - increase product quantity by one
 - get cart
 - delete cart
 - delete cart item
 */

 class CartService{
    //START REPO CART
    static async createUserCart({userId, product}){
        console.log(userId)
        const query = {cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet : {
                cart_products: product
            }
        },options = {upsert: true, new: true}
        return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }
        const updateSet = {
            $inc: {'cart_products.$.quantity': quantity}
        }
        const options = {upsert:true, new: true}
        //upsert: true, which means that if no matching document is found, a new document will be created, and new: true, which means that the updated document will be returned.
        const cart = await cartModel.findOne(query);
        if(cart){
            return await cartModel.findOneAndUpdate(query, updateSet, options)
        }else{
            const addProductQuery = {
                cart_userId: userId,
                cart_state: 'active'
            }
            const addProductUpdate = {
                $push: {
                    cart_products: {
                        productId: productId,
                        quantity: quantity,
                        name: product.name,
                        price: product.price,
                        shopId: product.shopId
                    }
                }
            };
            return await cartModel.findOneAndUpdate(addProductQuery, addProductUpdate, options);
        }
    }
    // END REPO CART

    static async addToCart({userId, product={}}){
        // check cart ton tai ko?
        const userCart = await cartModel.findOne({cart_userId: userId})
        if(!userCart){
            return await this.createUserCart({userId, product})
        }

        //neu gio hang ton tai, nhung ko co san pham
        if(!userCart.cart_products.length){
            
            userCart.cart_products = [product]
            return await userCart.save()
        }

        // neu gio hang ton tai  va co san pham nay, update quantity || chưa có sản phẩm thì thêm mới
        return await this.updateUserCartQuantity({userId, product})
    }

    // update cart
    /**
     shop_order_ids:[
        {
            shopId,
            item_products:[
                {
                    product_id,
                    quantity,
                    old_quantity,
                    price,
                    shopId,
                }
            ]
        }
     ]
     */
    static async addToCartV2({userId, shop_order_ids}){
        const {productId, quantity, old_quantity} = shop_order_ids[0].item_products[0]
        // check product
        const foundProduct = await getProductById(productId)
        if(!foundProduct){
            throw new NotFoundError("Product not found")
        }
        //compare
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError("Product not found")
        }

        if(quantity ===0 ){
            //deleted
        }

        return await this.updateUserCartQuantity({
            userId,
            product:{
                productId,
                quantity : quantity - old_quantity
            }
        })
    }

    static async deleteProductUserCart({userId, productId}){

        const query = { cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products: { productId}
            }
        }

        // không nên xoá hẳn, mà nên để vào một nơi nào đó, có thể sau này dùng để theo dõi thói quen người dùng

        const deleteCart = await cartModel.findOneAndUpdate(query, updateSet, {new: true})
        return deleteCart
    }

    static async getListUserCart(userId) {
        return await cartModel.findOne({cart_userId: +userId}).lean() //+ operator before userId is a unary plus operator, which converts the userId to a number if it is not already
    }
 }

 module.exports = CartService