const express = require('express')
const router = express.Router()
const getGoodsHandler = require('../router_handler/getGoods.js')

router.post('/getGoodsList', getGoodsHandler.getGoodsList)

router.post('/getGoodsById', getGoodsHandler.getGoodsById)

module.exports = router