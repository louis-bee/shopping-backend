const express = require('express')
const router = express.Router()
const adminHandler = require('../router_handler/admin.js')

router.post('/getUserList', adminHandler.getUserList)

router.post('/delUser',adminHandler.delUser)

router.post('/editUser',adminHandler.editUser)

module.exports = router