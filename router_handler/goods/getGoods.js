const db = require('../../db/index')

//获取商品列表
exports.getGoodsList = (req, res)=>{
  res.send({status:200, desc:'测试测试', data:{list:[
    {
      id: '8218',
      goodsName: '吉他手',
      status: 1,
      type: '唱片',
      price: 232.12,
      sales: 32,
      view: 1001,
      amount: 99,
      cover: {
        images: [],
      },
    }
  ]}})
  const page = { 
    pageSize: req.body.pageNum || 10,
    pageNum: req.body.pageNum || 1,
  }
      //获取商品时需要排除status为3的已删除商品
  if(req.body.sellerId) {
  }
  // const type = req.body.type
  // if(type==='all') {
  //   const sqlStr = 'select * from goods where goods_on = 1'
  //   db.query(sqlStr,(err,result)=>{
  //     if(err) return res.cc(err)
  //     const goodsList = result.map(item => {
  //       // 将图片的Buffer转换为Base64字符串
  //       if (item.goods_image) {
  //         // 假设图片是JPEG格式，如果是其他格式请替换MIME类型
  //         const base64Image = bufferToBase64(item.goods_image, 'image/jpg');
  //         item.goods_image = base64Image;
  //       }
  //       return item;
  //     });
  //     res.send({
  //       status: 200,
  //       message: '查询成功',
  //       data: {
  //         goodsList
  //       }
  //     })
  //   })
  // } else {
  //   const sql = 'select * from goods where goods_type=? and goods_on = 1'
  //   db.query(sql, type, (err,result)=>{
  //     if(err) {
  //       return res.cc(err)
  //     }
      
  //     const goodsList = result.map(item => {
  //       // 将图片的Buffer转换为Base64字符串
  //       if (item.goods_image) {
  //         // 假设图片是JPEG格式，如果是其他格式请替换MIME类型
  //         const base64Image = bufferToBase64(item.goods_image, 'image/jpg');
  //         item.goods_image = base64Image;
  //       }
  //       return item;
  //     });
  //     // console.log(goodsList);

  //     res.send({
  //       status: 200,
  //       message: '查询成功',
  //       data: {
  //         goodsList
  //       }
  //     })
  //   })
  // }
  
}
//获取商品详情
exports.getGoodsById = (req,res)=>{
  const goodsId = req.body.id
  const view = req.body.view
  const sqlget = 'select * from goods where id=?'
  db.query(sqlget, goodsId, (err, result)=>{
    if(err) {
      return res.cc(err)
    }
    if(result.length!==1) {
      return res.cc('查询失败')
    }
    //浏览量+1
    if(view) {
      const sqlview = `UPDATE goods SET view=? WHERE id=?`
      db.query(sqlview, [result[0].view+1, goodsId])
    }
    //图片地址列表 字符串转数组
    const imagesList = result[0].images.split('*')
    res.send({
      status: 200,
      message: '查询成功',
      data: {
        ...goodsDetail,
        images: imagesList
      }
    })
  })
}