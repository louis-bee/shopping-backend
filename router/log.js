const express = require('express')
const router = express.Router()
const logHandler = require('../router_handler/log.js')

router.post('/getLoginLogList', logHandler.getLoginLogList)

router.post('/delLoginLog', logHandler.delLoginLog)

module.exports = router