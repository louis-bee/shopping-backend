const express = require('express')
const router = express.Router()
const userHandler = require('../router_handler/user.js')

router.post('/login', userHandler.login)

router.post('/register', userHandler.register)

module.exports = router