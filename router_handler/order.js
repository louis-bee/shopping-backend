const db = require('../db/index')

//查询订单
exports.getOrderList = (req, res)=>{
  const userId = req.body.userId
  const sqlsearch = 'select * from orders where status!=1 and consumerId=?'
  db.query(sqlsearch, userId, (err,result)=>{
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
    // 截取数组，分页
    let pageGoodsIds = null
    const pageNum = req.body.pageNum
    const pageSize = req.body.pageSize
    if(pageNum&&pageSize) {
      const startIndex = (pageNum-1)*pageSize
      pageGoodsIds = goodsIds.slice(startIndex, startIndex+10)
    } else {
      pageGoodsIds = goodsIds
    }
    
    // 查询 goods 表，获取对应商品的 image 和 price
    const sqlGetGoods = 'select id, images, price, goodsName from goods where id in (?)';
    db.query(sqlGetGoods, [pageGoodsIds], (err, goodsResult) => {
      if (err) return res.cc(err);
      // 将 goodsResult 转换为一个对象，方便后续通过 goodsId 快速查找
      const goodsMap = goodsResult.reduce((acc, item) => {
        acc[item.id] = { images: item.images, price: item.price, goodsName: item.goodsName };
        return acc;
      }, {});

      // 将商品信息添加到订单列表中
      const orderList = result.map(item => {
        return {
          ...item,
          images: goodsMap[item.goodsId]?.images.split('*'),
          price: goodsMap[item.goodsId]?.price
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

}