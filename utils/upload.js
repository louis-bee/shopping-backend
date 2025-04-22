const multer = require('multer');
const path = require('path');

// 配置存储路径和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 设置文件存储的目录
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 设置文件名，避免文件名冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 创建 multer 实例
const upload = multer({ storage: storage });

module.exports = upload;