const db = require('../db/index')
const { codeStore } = require('../utils/store.js')

//获取商品列表
exports.getGoodsList = (req, res)=>{
  const role = req.body.role
  const sellerId = req.body.sellerId
  const userId = req.body.userId
  const type = req.body.type
  const pageSize = req.body.pageSize || 10
  const pageNum = req.body.pageNum || 1
  const offset = (pageNum-1)*pageSize
  if (sellerId) {  // 售卖后台查询
    // 查询符合条件的记录总数
    const sqlCount = 'select count(*) as total from goods where sellerId=? and status!=3';
    db.query(sqlCount, sellerId, (err, countResult) => {
      if (err) {
        return res.cc(err);
      }
      const total = countResult[0].total; // 获取总数
      // 查询分页数据0
      const sqlsearch = 'select * from goods where sellerId=? and status!=3 limit ? offset ?'
      db.query(sqlsearch, [sellerId, pageSize, offset], (err, result) => {
        if (err) {
          return res.cc(err);
        }
        const list = result.map(item=>{
          return {
            ...item,
            images: item.images.split('*')
          }
        })
        // 返回结果，包含分页数据和总记录数
        res.send({
          status: 200,
          desc: '查询成功',
          data: {
            list: list, // 分页数据
            total: total, // 总记录数
            pageSize: pageSize,
            pageNum: pageNum,
          },
        });
      });
    });
  } else if(role===1) {  //用户端查询
    if(type) {   //有分类
      const sqlCount = 'select count(*) as total from goods where type=? and status=2';
      db.query(sqlCount, type, (err, countResult) => {
        if (err) {
          return res.cc(err);
        }
        const total = countResult[0].total; // 获取总数
        // 查询分页数据
        const sqlsearch = 'select * from goods where type=? and status=2 limit ? offset ?'
        db.query(sqlsearch, [type, pageSize, offset], (err, result) => {
          if (err) {
            return res.cc(err);
          }
          const list = result.map(item=>{
            return {
              ...item,
              images: item.images.split('*')
            }
          })
          // 返回结果，包含分页数据和总记录数
          res.send({
            status: 200,
            desc: '查询成功',
            data: {
              list: list, // 分页数据
              total: total, // 总记录数
              pageSize: pageSize,
              pageNum: pageNum,
              codeStore
            },
          });
        });
      });
    } else { //无分类
      const sqlCount = 'select count(*) as total from goods where status=2';
      db.query(sqlCount, (err, countResult) => {
        if (err) {
          return res.cc(err);
        }
        const total = countResult[0].total; // 获取总数
        // 查询分页数据
        const sqlsearch = 'select * from goods where status=2 limit ? offset ?'
        db.query(sqlsearch, [pageSize, offset], (err, result) => {
          if (err) {
            return res.cc(err);
          }
          const list = result.map(item=>{
            return {
              ...item,
              images: item.images.split('*')
            }
          })
          // 返回结果，包含分页数据和总记录数
          res.send({
            status: 200,
            desc: '查询成功',
            data: {
              list: list, // 分页数据
              total: total, // 总记录数
              pageSize: pageSize,
              pageNum: pageNum,
            },
          });
        });
      });
    }
  }
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
      desc: '查询成功',
      data: {
        ...result[0],
        images: imagesList
      }
    })
  })
}