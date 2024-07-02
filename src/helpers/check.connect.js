'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

//os va process, tang toc request

const _SECONDS = 5000
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log('Number of connections: ', numConnection)
}


const checkOverLoad = () => {
    setInterval(()=> {
        const numberConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss

        const maxConnections = numCores * 5
        console.log(`Number of connections: ${numberConnection}`)
        console.log(`Memory Usage: ${memoryUsage/1024/1024} MB` )    
        if(numberConnection > maxConnections){
            console.log('Overload')
        }
    }, _SECONDS)
}
module.exports = {countConnect,checkOverLoad}