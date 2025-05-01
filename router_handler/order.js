const db = require('../db/index')

//查询订单（用户端）
exports.getOrderList = (req, res)=>{
  const userId = req.body.userId
  const pageNum = req.body.pageNum
  const pageSize = req.body.pageSize
  const startIndex = (pageNum-1)*pageSize

  const sqlsearch = `select * from orders where status!=1 and consumerId=?`
  db.query(sqlsearch, userId, (err,result)=>{
    if(err) return res.cc(err)
    if(result.length===0) {
      return res.send({
        status: 200,
        desc: "没有订单",
        data: {list:[]}
      })
    }

    const pageOrderResult = result.slice(startIndex, startIndex+pageSize)
    
    // 获取购物车中所有商品的 goodsId
    const goodsIds = pageOrderResult.map(item => item.goodsId);
    
    // 查询 goods 表，获取对应商品的 image 和 price
    const sqlGetGoods = 'select id, images, price, goodsName from goods where id in (?)';
    db.query(sqlGetGoods, [goodsIds], (err, goodsResult) => {
      if (err) return res.cc(err);
      // 将 goodsResult 转换为一个对象，方便后续通过 goodsId 快速查找
      const goodsMap = goodsResult.reduce((acc, item) => {
        acc[item.id] = { images: item.images, price: item.price, goodsName: item.goodsName };
        return acc;
      }, {});

      // 将商品信息添加到订单列表中
      const orderList = pageOrderResult.map(item => {
        return {
          ...item,
          images: goodsMap[item.goodsId]?.images.split('*'),
          price: goodsMap[item.goodsId]?.price,
          goodsName: goodsMap[item.goodsId]?.goodsName,
        };
      });

      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          list: orderList,
          total: result.length
        }
      });
    })
  })

}

//查询订单（销售端） （前端做分页）
exports.getOrderListBySeller = (req, res)=>{
  const type = req.body.type
  const sqlQuery = req.body.search
  let sqlSearch = ''
  //根据商品id/用户id/商家id
  if(type==='goods') {
    sqlSearch = `select * from orders where status!=1 and goodsId = ?`
  } else if(type==='seller') {
    sqlSearch = `select * from orders where status!=1 and sellerId = ?`
  } else if(type==='consumer') {
    sqlSearch = `select * from orders where status!=1 and consumerId = ?`
  } else {
    sqlSearch = `select * from orders where status!=1`
  }
  db.query(sqlSearch, sqlQuery, (err,result)=>{
    if(err) return res.cc(err)
    if(result.length===0) {
      return res.send({
        status: 200,
        desc: "没有订单",
        data: {list:[]}
      })
    }
    // 获取购物车中所有商品的 goodsId
    const goodsIds = result.map(item => item.goodsId);
    const userIds = result.map(item=> item.consumerId)
    // 截取数组，分页
    let pageGoodsIds = goodsIds
    let pageUserIds = userIds

    // 查询 goods 表，获取对应商品的 image 和 price
    const sqlGetGoods = 'select id, images, price, goodsName from goods where id in (?)';
    db.query(sqlGetGoods, [pageGoodsIds], (err, goodsResult) => {
      if (err) return res.cc(err);
      // 将 goodsResult 转换为一个对象，方便后续通过 goodsId 快速查找
      const goodsMap = goodsResult.reduce((acc, item) => {
        acc[item.id] = { images: item.images, price: item.price, goodsName: item.goodsName };
        return acc;
      }, {});
      
      // 查询 user 表，获取对应订单的 userName
      const sqlGetGoods = 'select id, userName from user where id in (?)';
      db.query(sqlGetGoods, [pageUserIds], (err, userResult) => {
        if (err) return res.cc(err);
        // 将 userResult 转换为一个对象，方便后续通过 goodsId 快速查找
        const userMap = userResult.reduce((acc, item) => {
          acc[item.id] = { userName: item.userName };
          return acc;
        }, {});

        // 将商品信息和用户名添加到订单列表中
      const orderList = result.map(item => {
        return {
          ...item,
          images: goodsMap[item.goodsId]?.images.split('*'),
          price: goodsMap[item.goodsId]?.price,
          goodsName: goodsMap[item.goodsId]?.goodsName,
          userName: userMap[item.consumerId]?.userName
        };
      });

      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          list: orderList
        }
      });

      })

      
    })
  })

}

//发货
exports.delivery = (req, res)=>{
  const {sellerId, orderId} = req.body
  //待优化: 校验销售人员

  const sqlsearch = `update orders set status = 3 where id = ?`
  db.query(sqlsearch, orderId, (err,result)=>{
    if(err) return res.cc(err)
    else {
      res.cc("发货成功",200)
    }
  })

}