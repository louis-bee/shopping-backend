const express = require('express')
const router = express.Router()
const dataHandler = require('../router_handler/data.js')

router.post('/getMonthTotalBySeller', dataHandler.getMonthTotalBySeller)

router.post('/getHotGoodsBySeller', dataHandler.getHotGoodsBySeller)

module.exports = router