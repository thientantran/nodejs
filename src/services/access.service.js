'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
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
                console.log("Shop already exist")
                return  {
                    code :"xxxx",
                    message: "Shop already exist"
                }
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({name, email, password: passwordHash , roles: [RoleShop.SHOP]})
            if(newShop) {
                // create privateKey and public key
                // console.log("create privateKey and public key")
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem',
                //     }
                // });

                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')
                
                const c = await KeyTokenService.createKeyToken({userId: newShop._id, publicKey, privateKey})
                if(!publicKey){
                    return {
                        code :"xxx",
                        message: "Error create keyStores"
                    }
                }

                // const publicKeyObject = crypto.createPublicKey(publicKeyString)

                //create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log("Created token success: ", tokens)

                return {
                    code:201,
                    metadata:{
                        shop: getInfoData({fildes: ["_id", "name", "email"], object: newShop}),
                        tokens
                    }
                }
            }
            return{
                code:200,
                metadata: null
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