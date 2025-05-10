const db = require('../db/index')
const actionLoger = require('../utils/actionLoger.js')

//查询购物车
exports.getCartList = (req, res)=>{
  const userId = req.body.userId

  //日志
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    actionLoger.log(ip, `查询购物车列表`, 1, 1, userId)
  } catch {}

  const sqlsearch = 'select * from orders where status=1 and consumerId=?'
  db.query(sqlsearch, userId, (err,result)=>{
    if(err) return res.cc(err)
    if(result.length===0) {
      return res.send({
        status: 200,
        desc: "购物车为空",
        data: {list:[]}
      })
    }
    // 获取购物车中所有商品的 goodsId
    const goodsIds = result.map(item => item.goodsId);
    // 查询 goods 表，获取对应商品的 image 和 price
    const sqlGetGoods = 'select id, images, price, goodsName, status from goods where id in (?)';
    db.query(sqlGetGoods, [goodsIds], (err, goodsResult) => {
      if (err) return res.cc(err);
      // 将 goodsResult 转换为一个对象，方便后续通过 goodsId 快速查找
      const goodsMap = goodsResult.reduce((acc, item) => {
        acc[item.id] = { images: item.images, price: item.price, goodsName: item.goodsName, status: item.status };
        return acc;
      }, {});

      //待优化： 需要处理下架的商品

      // 将商品信息添加到购物车列表中
      const cartList = result.map(item => {
        return {
          ...item,
          ...goodsMap[item.goodsId],
          images: goodsMap[item.goodsId]?.images.split('*'),
          // price: goodsMap[item.goodsId]?.price
        };
      });

      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          list: cartList
        }
      });
    })
  })
}

//添加至购物车
exports.addToCart = (req,res)=> {
  const { userId, goodsId, number } = req.body
  const sqlGoods = 'select * from goods where id=?'
  db.query(sqlGoods, goodsId,(err,goodsResult)=>{
    if(err) {
      return res.cc(err)
    }
    if(goodsResult.length<1) {
      return res.cc('查询不到商品')
    }
    const sellerId = goodsResult[0].sellerId
    //查询是否已经有购物车
    const sqlCart = 'select * from orders where consumerId = ? and goodsId = ? and status = 1'
    db.query(sqlCart, [userId, goodsId], (err,cartResult)=>{
      if(err) return res.cc(err)
      //购物车里还没有相同商品，新增
      if(cartResult.length===0) { 
        const sqlAdd = 'insert into orders set ?'
        const orderInfo = {
          goodsId: goodsId,
          sellerId: sellerId,
          consumerId: userId,
          number: number,
          status: 1,
          time: null
        }
        db.query(sqlAdd,orderInfo, (err,addResult)=>{
          if(err) return res.cc(err)
          if(addResult.affectedRows!==1) return res.cc('添加失败')
          //日志
          try {
            const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
            actionLoger.log(ip, `添加${number}个商品${goodsId}到购物车`, 2, 1, userId)
          } catch {}
          return res.send({
            status: 200,
            desc: '添加成功',
            data: {
              cartNumAdd: true,
            }
          })      
        })
      } else { //添加数量
        const orderId = cartResult[0].id
        const newNumber = number + cartResult[0].number
        const sqlUpdate = 'update orders set number = ? where id = ?'
        db.query(sqlUpdate, [newNumber, orderId] ,(err, updateResult)=>{
          if(err) return res.cc(err)
          if(updateResult.affectedRows!==1) return res.cc('添加失败')
          //日志
          try {
            const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
            actionLoger.log(ip, `修改购物车商品数量为${number},订单id:${orderId}`, 3, 1, userId)
          } catch {}
          return res.send({
            status: 200,
            desc: '添加成功',
            data: {
              cartNumAdd: false,
            }
          })    
        })
      }
    })
  })
}


//修改购物车数量
exports.updateCart = (req,res)=> {
  const { userId, orderId, number } = req.body
  //待优化： 添加用户id的校验



  const sqlUpdate = 'UPDATE orders SET number = ? WHERE id = ?';
  db.query(sqlUpdate, [number, orderId], (err, result) => {
    if (err) {
      res.cc(err);
    } else {
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `修改购物车商品数量为${number},订单id:${orderId}`, 3, 1, userId)
      } catch {}
      res.send({
        status: 200,
        desc: '更新数量成功'
      })
    }
  })
}

//移出购物车
exports.deleteCart = (req,res) =>{
  const { orderId, userId } = req.body
  //待优化： 添加用户id的校验
  const sql = 'delete from orders where id = ?';
  db.query(sql, orderId, (err, result) => {
    if (err) {
      res.cc(err);
    } else {
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `移出购物车,订单id:${orderId}`, 3, 1, userId)
      } catch {}
      res.send({
        status: 200,
        desc: '已从购物车删除'
      })
    }
  })
}

//购物车数量
exports.getCartNum = (req,res) =>{
  const { userId } = req.body
  const sql = 'select count(*) as cartNum from orders where consumerId = ? and status = 1';
  db.query(sql, userId, (err, result) => {
    if (err) {
      res.cc(err);
    } else {
      const cartNum = result[0].cartNum
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `获取购物车数量`, 1, 1, userId)
      } catch {}
      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          cartNum: cartNum
        }
      })
    }
  })
}