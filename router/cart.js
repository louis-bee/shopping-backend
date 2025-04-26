const express = require('express')
const router = express.Router()
const cartHandler = require('../router_handler/cart.js')

router.post('/getCartList', cartHandler.getCartList)

router.post('/addToCart', cartHandler.addToCart)

router.post('/updateCart', cartHandler.updateCart)

router.post('/deleteCart', cartHandler.deleteCart)

module.exports = router