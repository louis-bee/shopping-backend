const db = require('../db/index')
const actionLoger = require('../utils/actionLoger.js')

//创建商品
exports.addGoods = (req,res)=>{
  const goodsInfo = req.body.goodsInfo
  if(!goodsInfo.sellerId||!goodsInfo.goodsName||!goodsInfo.type||!goodsInfo.desc||!goodsInfo.price||!goodsInfo.status||!goodsInfo.amount||!goodsInfo.images) {
    return res.cc('字段不能为空')
  }
  const imagesList = goodsInfo.images.join('*')
  const sqlsearch = 'select * from goods where goodsName=?'
  db.query(sqlsearch, goodsInfo.goodsName, (err,result)=>{
    if(err) {
      return res.cc(err)
    }
    if(result.length>0) { 
      return res.cc('商品重名, 请重新输入商品名')
    }
    const sqlinsert = 'insert into goods set ?'
    db.query(sqlinsert, {...goodsInfo, images:imagesList}, (err,result)=>{
      if(err) return res.cc(err)
      if(result.affectedRows!==1) return res.cc('发布失败')
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `发布商品${goodsInfo.goodsName}`, 2, 2, goodsInfo.sellerId)
      } catch {}
      res.cc('发布成功',200 )
    })
  })
}

//修改商品
exports.updateGoods = (req,res)=>{
  const goodsInfo = req.body.goodsInfo
  const role = req.body.role
  const userId = req.body.userId
  
  if(!goodsInfo.sellerId||!goodsInfo.goodsName||!goodsInfo.type||!goodsInfo.desc||!goodsInfo.price||!goodsInfo.status||goodsInfo.amount===undefined||goodsInfo.view===undefined||goodsInfo.sales===undefined||!goodsInfo.images) {
    return res.cc('字段不能为空')
  }
  const sqlsearch = 'select * from goods where id=?'
  db.query(sqlsearch, goodsInfo.id, (err, result)=>{
    if(err) {
      return res.cc(err)
    }
    if(result.length>0) { 
      //更新商品数据库
      const imagesList = goodsInfo.images.join('*')
      const sql = 'UPDATE goods SET sellerId=?, goodsName=?, type=?, \`desc\`=?, price=?, status=?, amount=?, view=?, sales=?, images=? WHERE id=?'
      db.query(sql, [goodsInfo.sellerId, goodsInfo.goodsName, goodsInfo.type, goodsInfo.desc, goodsInfo.price, goodsInfo.status, goodsInfo.amount, goodsInfo.view, goodsInfo.sales, imagesList, goodsInfo.id],(err,result)=>{
        if(err) return res.cc(err)
        if(result.affectedRows!==1) return res.cc('修改失败')
        else {
          //日志
          try {
            const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
            actionLoger.log(ip, `修改商品${goodsInfo.goodsId}`, 3, role, userId)
          } catch {}
          res.send({
            status:200,
            desc:'商品修改成功'
          })
        }
      })
    } else {
      res.cc('查询不到该商品，修改失败')
    }
  })
}

// 删除商品
exports.delGoods = (req, res) => {
  const goodsId = req.body.id;
  const role = req.body.role
  const userId = req.body.userId

  db.query('UPDATE goods SET status=3 WHERE id=?', [goodsId], (err, result)=>{
    if(err) {
      return res.cc(err);
    }
    if(result.affectedRows!==1) {
      return res.cc('删除失败')
    } else {
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `删除商品${goodsId}`, 4, role, userId)
      } catch {}
      res.send({
        status: 200,
        desc: '删除商品成功',
      })
    }
  });
};