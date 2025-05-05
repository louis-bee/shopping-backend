const db = require('../db/index.js')
const moment = require('moment')

//获取近15天销量
exports.getMonthTotalBySeller = (req, res)=>{
  const { sellerId } = req.body
  const sqlOrder = 'select * from orders where sellerId = ? and status!=1'
  db.query(sqlOrder, sellerId, (err, orderResult)=>{
    if(err) res.cc(err)
    if(orderResult.length<1) res.cc('暂无数据')

      // 统计每天的订单数量
      const orderCount = {};
      orderResult.forEach(item => {
        const date = moment(item.time).utc().format('YYYY-MM-DD'); // 转换为 UTC 时间并格式化
        if (!orderCount[date]) {
          orderCount[date] = 0;
        }
        orderCount[date] += item.number;
      });

      //获取近三十天的日期范围
      const dates = [];
      for (let i = 0; i < 15; i++) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        dates.push(date);
      }

      stats = dates.map(date => ({
        date: date,
        count: orderCount[date] || 0
      })); 

    res.send({
      status: 200,
      desc: '查询成功',
      data: {
        monthTotal: {
          dates: stats.map(item=>item.date).reverse(),
          sales: stats.map(item=>item.count).reverse()
        }
      }
    })
  })
}

// exports.getHotGoodsBySeller = (req, res)=>{
//   const { sellerId } = req.body
//   const sqlOrder = 'select * from orders where sellerId = ?'
//   db.query(sqlOrder, sellerId,(err,result )=>{
//     if(err) return res.cc(err)

//   })

//   我现在需要返回这个销售人员销量最高的5个商品的商品名和销量
//   返回的格式如下
//   res.send({
//     status:200,
//     desc: '查询成功',
//     data: {
//       hotGoods: {
//         goods: [],
//         sales: []
//       }
//     }
//   })

//   数据库说明:
//   orders表：包含(id订单号, sellerId销售人员, goodsId商品id, number数量)
//   goods表：包含(id商品id, goodsName商品名称)

// }

//获取销量最高的5个
exports.getHotGoodsBySeller = (req, res) => {
  const { sellerId } = req.body;

  // 查询指定销售人员的订单数据
  const sqlOrder = 'SELECT goodsId, SUM(number) AS totalSales FROM orders WHERE sellerId = ? and status!=1 GROUP BY goodsId ORDER BY totalSales DESC LIMIT 5';
  db.query(sqlOrder, sellerId, (err, result) => {
    if (err) return res.cc(err);

    // 提取商品ID和销量
    const goodsIds = result.map(item => item.goodsId);
    const sales = result.map(item => item.totalSales);

    // 查询商品名称
    const sqlGoods = 'SELECT id, goodsName FROM goods WHERE id IN (?)';
    db.query(sqlGoods, [goodsIds], (err, goodsResult) => {
      if (err) return res.cc(err);

      // 创建商品名称和ID的映射
      const goodsMap = {};
      goodsResult.forEach(good => {
        goodsMap[good.id] = good.goodsName;
      });

      // 构建返回数据
      const hotGoods = {
        goods: goodsIds.map(id => goodsMap[id]),
        sales: sales
      };

      // 返回结果
      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          hotGoods
        }
      });
    });
  });
};


exports.getMonthLoginByAdmin = (req, res) => {
  const { adminId } = req.body;

  // 获取当前时间的30天前的时间戳
  const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');

  // 删除30天前的登录数据
  const sqlDelete = `DELETE FROM logindata WHERE loginTime < '${thirtyDaysAgo}'`;

  db.query(sqlDelete, (deleteErr) => {
    if (deleteErr) {
      return res.cc(deleteErr);
    }

    // 查询近15天的登录数据
    const sqlLogin = `SELECT * FROM logindata WHERE loginTime >= '${thirtyDaysAgo}'`;

    db.query(sqlLogin, (err, loginResult) => {
      if (err) return res.cc(err);
      if (loginResult.length < 1) return res.cc('暂无数据');

      // 统计每天的登录数量
      const orderCount = {};
      loginResult.forEach(item => {
        const date = moment(item.loginTime).utc().format('YYYY-MM-DD'); // 转换为 UTC 时间并格式化
        if (!orderCount[date]) {
          orderCount[date] = 0;
        }
        orderCount[date] += 1;
      });

      // 获取近15天的日期范围
      const dates = [];
      for (let i = 0; i < 15; i++) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        dates.push(date);
      }

      const stats = dates.map(date => ({
        date: date,
        count: orderCount[date] || 0
      }));

      res.send({
        status: 200,
        desc: '查询成功',
        data: {
          monthLogin: {
            dates: stats.map(item => item.date).reverse(),
            counts: stats.map(item => item.count).reverse()
          }
        }
      });
    });
  });
};

//获取销量最高的5个xsller
exports.getTopSeller = (req, res) => {
  const { adminId } = req.body;

  // 查询top5
  const sqlOrder = 'SELECT sellerId, SUM(number) AS totalSales FROM orders WHERE status!=1 GROUP BY sellerId ORDER BY totalSales DESC LIMIT 5';
  db.query(sqlOrder, (err, result) => {
    if (err) return res.cc(err);

    // 提取商品ID和销量
    const sellers = result.map(item => item.sellerId);
    const counts = result.map(item => item.totalSales);

    res.send({
      status:200,
      desc:'查询成功',
      data: {
        topSeller: {
          sellers: sellers,
          counts: counts
        }
      }
    })

  });
};