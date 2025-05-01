const express = require('express')
const router = express.Router()
const userHandler = require('../router_handler/user.js')

router.post('/login', userHandler.login)

router.post('/register', userHandler.register)

router.post('/logout', userHandler.logout)

router.post('/refreshToken', userHandler.refreshToken)

router.post('/sendAdminCode', userHandler.sendAdminCode)

module.exports = router