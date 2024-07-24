'use strict'

const AccessService = require("../services/access.service")

class AccessController {
   
    signUp = async (req, res, next) => {
    try {   
            const {name, email, password} = req.body
            console.log(name, email, password)
            const result = await AccessService.signUp({name, email, password})
            return res.status(201).json({
                code : '20001',
                metadata: {userid: 1}
            })

    } catch (error) {
        next(error)
    }
    }
}

module.exports = new AccessController()