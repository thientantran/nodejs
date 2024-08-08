'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandler')
const discountController = require('../../controllers/discount.controller')

const router = express.Router()
router.get("/shop/:shopId", asyncHandler(discountController.getAllDiscountCodeByShopId))

router.use(authenticationV2)
router.get("/:code", asyncHandler(discountController.getAllProductWithDiscountCode))
router.post("", asyncHandler(discountController.createDiscountCode))

module.exports = router