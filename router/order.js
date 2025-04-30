const express = require('express')
const router = express.Router()
const orderHandler = require('../router_handler/order.js')

router.post('/getOrderList', orderHandler.getOrderList)

module.exports = router