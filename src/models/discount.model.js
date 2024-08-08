'use strict'

const {model, Schema, Types} = require("mongoose")

const DOCUMENT_NAME = 'Discount'
const CONNECTION_NAME = 'Discounts'

const discountSchema = new Schema({
    discount_name : {type: String, required: true},
    discount_description: {type: String, required: true},
    discount_type: {type: String, default: "fixed_amount"}, // percentage
    discount_value: {type: Number, required: true}, // 10.000
    discount_code:  {type: String, required: true},
    discount_start_date : {type: Date, required: true},
    discount_end_date : {type: Date, required: true},
    discount_max_uses: {type: Number, required: true}, // số lượt áp dụng
    discount_uses_count: {type: Number, required: true}, // số lượt đã áp dụng
    discount_users_used: {type: Array, default: []}, // user đã áp dụng
    discount_max_uses_per_user: {type: Number, required: true}, // số lượt áp dụng tối đa cho 1 user
    discount_min_order_value: {type: Number, required: true}, // giá trị đơn hàng tối thiểu để áp dụng,
    discount_max_value: {type: Number, required: true}, // giá trị tối đa áp dụng
    discount_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    
    discount_is_active: {type: Boolean, default: true},
    discount_applies_to: {type: String, required: true, enum:['all', 'specific']}, // apply tất cả đơn hangf hay 1 số, hay là  1 số product, tất cả
    discount_product_ids: {type: Array, default: []}, // danh sách product áp dụng
}, {
    timestamps: true,
    collection: CONNECTION_NAME
})

module.exports = model(DOCUMENT_NAME, discountSchema)
