'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandler')
const productController = require('../../controllers/product.controller')
const router = express.Router()

router.use(authenticationV2)

router.post("", asyncHandler(productController.createProduct))

// QUERY
/**
 * @desc Get all Drafts for shop
 * @route GET /v1/api/product/drafts/all
 * @access Private
 * @returns {Array} - All drafts for shop
 */
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop))
module.exports = router