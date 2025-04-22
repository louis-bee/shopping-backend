const express = require('express')
const router = express.Router()
const uploadHandler = require('../router_handler/upload.js')
const upload = require('../utils/upload.js'); // 引入 multer 配置

router.post('', upload.single('image'), uploadHandler.upload)

module.exports = router