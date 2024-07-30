'use strict'

const { CREATED } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {
   
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