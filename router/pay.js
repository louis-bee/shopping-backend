const express = require('express')
const router = express.Router()
const payHandler = require('../router_handler/pay.js')

router.post('/getBalance', payHandler.getBalance)

router.post('/payBill', payHandler.payBill)

module.exports = router