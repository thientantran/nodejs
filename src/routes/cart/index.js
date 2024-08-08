'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandler')
const cartController = require('../../controllers/cart.controller')

const router = express.Router()

router.post("", asyncHandler(cartController.addToCart))
router.get("", asyncHandler(cartController.listToCart))
router.delete("", asyncHandler(cartController.delete))
router.post("/update", asyncHandler(cartController.update))

module.exports = router