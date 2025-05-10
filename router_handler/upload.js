const actionLoger = require('../utils/actionLoger.js')

//处理上传图片
exports.upload = (req,res)=>{
  // 检查是否有文件上传
  if (!req.file) {
    return res.cc('上传失败')
  }
  // 获取文件信息
  const { filename, path: filePath, mimetype } = req.file;

  res.send({
    status:200,
    desc: '文件上传成功',
    data: {
      url: filename,  //文件名
      path: filePath,
      mimetype: mimetype
    }
  })
}