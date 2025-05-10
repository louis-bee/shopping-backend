const express = require('express')
const router = express.Router()
const logHandler = require('../router_handler/log.js')

router.post('/getLoginLogList', logHandler.getLoginLogList)

router.post('/delLoginLog', logHandler.delLoginLog)

router.post('/getActionLogList', logHandler.getActionLogList)

router.post('/delActionLog', logHandler.delActionLog)

module.exports = router