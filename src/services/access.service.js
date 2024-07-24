'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const RoleShop = {
    SHOP:"SHOP",
    WRITER:"WRITER",
    EDITOR:"EDITOR",
    ADMIN:"ADMIN"
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try {
            const holderShop = await shopModel.findOne({email}).lean()
            // .lean() is used to return a plain javascript object instead of a mongoose document
            if(holderShop){
                return  {
                    code :"xxxx",
                    message: "Shop already exist"
                }
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({name, email, password: passwordHash , roles: [RoleShop.SHOP]})
            console.log("new shop:",newShop)
            if(newShop) {
                // create privateKey and public key
                console.log("create privateKey and public key")
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                });
                console.log("zo: ",privateKey, publicKey)
            }

        } catch (error) {
            return {
                code :"xxx",
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService