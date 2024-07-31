'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        const result = await AccessService.handlerRefreshToken(req.body.refreshToken)
        new SuccessResponse({
            message: "Get token successfully",
            metadata: result
        }).send(res)

    }

    logout = async (req, res, next) => {
        const result = await AccessService.logout(req.keyStore)
        new SuccessResponse({
            message: "Logout successfully",
            metadata: result
        }).send(res)

    }

    login = async (req, res, next) => {
        // try {
            const result = await AccessService.login(req.body)
            // return res.status(200).json(result)
            new SuccessResponse({
                metadata: result,
            }).send(res)
        // } catch (error) {
        //     next(error)
        // }
    }

    signUp = async (req, res, next) => {
    // try {   
            const {name, email, password} = req.body
            console.log(name, email, password)
            const result = await AccessService.signUp({name, email, password})
            // return res.status(201).json(result)
            new CREATED({
                message: "Shop registerd successfully",
                metadata: result,
                options: {
                    limit:10
                }
            }).send(res)

    // } catch (error) {
    //     next(error)
    // }
    }
}

module.exports = new AccessController()