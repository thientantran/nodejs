'use strict'

const mongoose = require('mongoose')
const  {countConnect} = require("../helpers/check.connect")
const {db: {host, name, port}} = require("../configs/config.mongodb")
const connectString = `mongodb://${host}:${port}/${name}`
console.log(connectString)
// chỉ khởi tạo 1 kết nối
class Database {
    constructor (){
       this.connect() 
    }

    connect(type = 'mongodb'){
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color:true})
        }
        //Pool: Đây là số lượng kết nối được duy trì trong bộ nhớ mà ứng dụng có thể sử dụng lại thay vì tạo mới mỗi khi cần truy cập cơ sở dữ liệu. Pool kết nối giúp cải thiện hiệu suất ứng dụng bằng cách giảm thời gian cần thiết để thiết lập kết nối mới.≈
        mongoose.connect(connectString, {maxPoolSize:50}).then( _ => {
            console.log('Connected to MongoDB just 1 time')
            
            countConnect()
            }).catch( err => {
            console.error('Error connecting to MongoDB', err)
            }
        )
    }
    static getInstance(){
        if(!this.instance){
            this.instance = new Database()
        }
        return this.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb 