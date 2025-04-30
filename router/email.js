const express = require('express')
const router = express.Router()
const emailHandler = require('../router_handler/email.js')

router.post('/sendCode', emailHandler.sendCode)

module.exports = router