const db = require('../db/index')
const { codeStore } = require('../utils/store.js')
const emailCtrl = require('../utils/email.js'); 
const actionLoger = require('../utils/actionLoger.js')

//查询余额
exports.getBalance = (req, res)=>{
  const userId = req.body.userId
  const sqlsearch = 'select * from user where id=1'
  db.query(sqlsearch, userId, (err,result)=>{
    if(err) return res.cc(err)
    if(result.length===0) {
      return res.cc("没有该用户")
    }
    //日志
    try {
      const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
      actionLoger.log(ip, `查询余额`, 1, 1, userId)
    } catch {}
    res.send({
      status: 200,
      desc: '查询成功',
      data: {
        userId: result[0].id,
        balance: result[0].balance
      }
    });
  })
}

//支付操作
exports.payBill = (req, res)=>{
  const { orderIdList, userId, code, email, address, newBalance } = req.body
  //查询验证码是否正确
  //1.是否正确
  
  if(!codeStore[email] || codeStore[email].code!==parseInt(code) || codeStore[email].userId!==userId) return res.cc("验证码错误")
  //2.是否过期
  const timeGap = (new Date() - codeStore[email].time)/1000
  if(timeGap>70) return res.cc("验证码已过期")

  //待优化：校验余额
  const sqlEditBalance = 'update user set balance = ? where id = ?'
  db.query(sqlEditBalance, [newBalance, userId], (err, editResult)=>{
    if(err) return res.cc(err)
    //根据orderIdList修改orders
    // const orderIdListStr = orderIdList.join(','); 
    const sqlBuy = 'update orders set status=2, time= ? , address= ? where id in (?)'
    db.query(sqlBuy, [new Date(), address, orderIdList], (err, result)=>{
      if(err) return res.cc(err)
      //清理验证码缓存
      delete codeStore[email]
      
      //更新销量
      const sqlSearch = 'select goodsId, number from orders where id in (?)'
      db.query(sqlSearch, [orderIdList], (err,searchResult)=>{
        if(err) return res.cc(err)
        // 构造更新销量的 SQL 语句和参数
        const updates = searchResult.map(item => ({
          goodsId: item.goodsId,
          salesIncrement: item.number,
        }));
        
        const sqlAddSales = 'UPDATE goods SET sales = sales + ? WHERE id = ?';
        // const updateParams = updates.flatMap(item => [item.salesIncrement, item.goodsId]);

        const updatePromises = updates.map(update => {
          return new Promise((resolve, reject) => {
            db.query(sqlAddSales, [update.salesIncrement, update.goodsId], (err, addResult) => {
              if (err) reject(err);
              else resolve(addResult);
            });
          });
        });
      
        // 使用 Promise.all 等待所有更新完成
        Promise.all(updatePromises).then(() => {
          //日志
          try {
            const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
            actionLoger.log(ip, `支付订单`, 1, 3, userId)
          } catch {}
          res.send({
            status: 200,
            desc: '支付成功',
            data: {
              balance: newBalance
            }
          });
        }).catch(err => {
          res.cc(err);
        });
        // db.query(sqlAddSales, updateParams, (err, addResult) => {
        //   if (err) return res.cc(err);
        //   res.send({
        //     status: 200,
        //     desc: '支付成功',
        //     data: {
        //       balance: newBalance
        //     }
        //   });
        // })
      })
    })
  })
}

//发送验证码
exports.sendCode = (req, res)=>{

  const { email, userId } = req.body
	if (!email) {
		return res.cc('邮箱格式错误')
	} //email出错时或者为空时
	const code = parseInt(Math.random(0, 1) * 100000) //生成随机验证码
  const now = new Date()
	//发送邮件

	//清理过期验证码
  for (const emailKey in codeStore) {
    if ((now - codeStore[emailKey].time) / (1000 * 60) > 60) { //大于60分钟 
      delete codeStore[emailKey];
    }
  }

	emailCtrl.sendMail(email, code, (state) => {
		if (state) {
      codeStore[email] = { code, time: now, userId }
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `发送支付验证码`, 1, 1, userId)
      } catch {}
			return res.send({
        status: 200,
        desc: '验证码已发送',
      })
		} else {
			return res.cc("发送失败")
		}
	})
}


exports.recharge = (req, res)=>{
  const { userId, money } = req.body
  const sqlSelect = 'select balance from user where id = ?'
  db.query(sqlSelect, userId, (err,selResult)=>{
    if(err) return res.cc(err)
    const newBalance = selResult[0].balance + money
    const sqlEditBalance = 'update user set balance = ? where id = ?'
    db.query(sqlEditBalance, [newBalance, userId], (err, editResult)=>{
      if(err) return res.cc(err)
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `充值${money}元`, 3, 1, userId)
      } catch {}
      res.send({
        status:200,
        desc: '充值成功',
        data:{
          balance: newBalance
        }
      })
    })
  })
}