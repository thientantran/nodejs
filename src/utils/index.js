'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = id => new Types.ObjectId(id)

const getInfoData = ({fildes = [], object = {} }) => {
    return _.pick(object, fildes)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}

const removeNullObject = obj => {
    Object.keys(obj).forEach (k => {
        if (obj[k] ==null){
            delete obj[k]
        }
    })
    return obj
}

// hàm này để parse nested object thành dạng flat object, ví dụ: {a: {b: 1, c: 2}} => {a.b: 1, a.c: 2}, null sẽ bị remove
const updateNestedObjectParser = obj => {
    const final = {}
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(k => {
            if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                const response = updateNestedObjectParser(obj[k]);
                Object.keys(response).forEach(a => {
                    final[`${k}.${a}`] = response[a];
                });
            } else {
                final[k] = obj[k];
            }
        });
    }
    return final
}
module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeNullObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}