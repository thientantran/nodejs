'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN:'refreshtoken'
}
const createTokenPair = async(payload, publicKey, privateKey) => {
    try {
        const accessToken = JWT.sign(payload, publicKey, {expiresIn: '2 days'})
        const refreshToken = JWT.sign(payload, privateKey, {expiresIn: '7 days'})
        JWT.verify(accessToken, publicKey, (err, decoded) => {
         if(err){
            console.log("err:: ",err)
         }else{
            console.log("decoded verify:: ",decoded)
         }   
        })
        return {accessToken, refreshToken}
    } catch (error) {
        
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1 - check userId missing
        2 - get access token
        3 - verify token
        4 - check user in db
        5 -  check keyStore with userId
        6 - if OK -> next()
    */
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) {
        throw new AuthFailureError("Authentication failed")
    }

    const keyStore = await findByUserId(userId)
    if(!keyStore){
        throw new NotFoundError("Not found keyStore")
    }
    console.log("keyStore:: ", keyStore)
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken){
        throw new AuthFailureError("Authentication failed")
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId!==decodeUser.userId){
            throw new AuthFailureError("Invalid User")
        }
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
        1 - check userId missing
        2 - get access token
        3 - verify token
        4 - check user in db
        5 -  check keyStore with userId
        6 - if OK -> next()
    */
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) {
        throw new AuthFailureError("Authentication failed")
    }

    const keyStore = await findByUserId(userId)
    if(!keyStore){
        throw new NotFoundError("Not found keyStore")
    }

    if(req.headers[HEADER.REFRESH_TOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if(userId!==decodeUser.userId){
                throw new AuthFailureError("Invalid User")
            }
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken){
        throw new AuthFailureError("Authentication failed")
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId!==decodeUser.userId){
            throw new AuthFailureError("Invalid User")
        }
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async(token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}