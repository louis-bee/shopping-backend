const express = require('express')
const router = express.Router()
const getGoodsHandler = require('../router_handler/goods/getGoods.js')
const manageGoodsHandler = require('../router_handler/goods/manageGoods.js')

router.post('/getGoodsList', getGoodsHandler.getGoodsList)

router.post('/getGoodsById', getGoodsHandler.getGoodsById)

router.post('/addGoods', manageGoodsHandler.addGoods)

router.post('/updateGoods', manageGoodsHandler.updateGoods)

router.post('/delGoods', manageGoodsHandler.delGoods)

module.exports = router