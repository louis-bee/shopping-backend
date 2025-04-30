const db = require('../db/index')
const { codeStore } = require('../utils/store.js')

//查询余额
exports.getBalance = (req, res)=>{
  const userId = req.body.userId
  const sqlsearch = 'select * from user where id=1'
  db.query(sqlsearch, userId, (err,result)=>{
    if(err) return res.cc(err)
    if(result.length===0) {
      return res.cc("没有该用户")
    }
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
  console.log('1:',codeStore);
  
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
      console.log('delete',codeStore);
      
      res.send({
        status: 200,
        desc: '支付成功',
        data: {
          balance: newBalance
        }
      });
    })
  })
}