'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const RoleShop = {
    SHOP:"SHOP",
    WRITER:"WRITER",
    EDITOR:"EDITOR",
    ADMIN:"ADMIN"
}

class AccessService {
    /*
        check token used?
    */
    static handlerRefreshToken = async (refreshToken) => {
        // check xem token da duoc su dung chua?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if(foundToken){
            //decode xem who are you?
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log("userId, email:: ", userId, email)
            // xoa tat ca token cua user
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError("Something wrong happen!! please re-login")
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken){
            throw new AuthFailureError("Invalid token")
        }
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log("[2] -- userId, email:: ", userId, email)
        
        const foundShop = await findByEmail({email})

        if(!foundShop){
            throw new AuthFailureError("Shop not registered")
        }

        // create token moi
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update token
        await KeyTokenService.updateToken(holderToken._id, {
            refreshToken: tokens.refreshToken,
            refreshTokensUsed: refreshToken
        });

        return {
            user : {userId, email},
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log("delKey:: ", delKey)
        return delKey
    }

    /*
    1- check email
    2- match password
    3- create access token and refresh token
    4- generate tokens
    5- get data return login
    */
    static login = async ({email, password, refreshToken = null} )=> {
        const foundShop = await findByEmail({email})
        if (!foundShop){
            throw new BadRequestError("Shop not found")
        }

        const match = await bcrypt.compare(password, foundShop.password)
        if(!match){
            throw new AuthFailureError("Authentication error")
        }

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKey, privateKey)
        console.log("Created token success: ", tokens)
        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken:tokens.refreshToken,
        })

        return {
            shop: getInfoData({fildes: ["_id", "name", "email"], object: foundShop}),
            tokens
        }
    }

    static signUp = async ({name, email, password}) => {
        // try {
        // make a error: a is not defined
            // a
            const holderShop = await shopModel.findOne({email}).lean()
            // .lean() is used to return a plain javascript object instead of a mongoose document
            if(holderShop){
                console.log("Shop already exist")
                throw new BadRequestError("Shop already exist")
                // return  {
                    // code :"xxxx",
                    // message: "Shop already exist"
                // }
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
                const c = await KeyTokenService.createKeyToken({userId: newShop._id, publicKey, privateKey, refreshToken: tokens.refreshToken})
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

        // } catch (error) {
        //     return {
        //         code :"xxx",
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService