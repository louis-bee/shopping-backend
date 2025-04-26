const express = require('express')
const router = express.Router()
const manageGoodsHandler = require('../router_handler/manageGoods.js')

router.post('/addGoods', manageGoodsHandler.addGoods)

router.post('/updateGoods', manageGoodsHandler.updateGoods)

router.post('/delGoods', manageGoodsHandler.delGoods)

module.exports = router