'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandler')
const productController = require('../../controllers/product.controller')
const router = express.Router()

router.use(authenticationV2)

router.post("", asyncHandler(productController.createProduct))
router.post("/publish/:id", asyncHandler(productController.publishProductByShop))
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop))
// QUERY
/**
 * @desc Get all Drafts for shop
 * @route GET /v1/api/product/drafts/all
 * @access Private
 * @returns {Array} - All drafts for shop
 */
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop))
router.get("/published/all", asyncHandler(productController.getAllPublishForShop))
module.exports = router