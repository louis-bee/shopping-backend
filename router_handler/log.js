const db = require('../db/index.js')
const moment = require('moment')

//获取登录日志
exports.getLoginLogList = (req, res)=>{
  const { search, role } = req.body
  let sqlgetList
  let query
  if(search) {
    sqlgetList = 'select * from logindata where userId = ? order by id desc'
    query = search
  } else {
    sqlgetList = 'select * from logindata where role = ? order by id desc'
    query = role
  }

  db.query(sqlgetList, query, (err, logResult)=>{
    if(err) return res.cc(err)

    const idList = logResult.map(item=>item.userId)
    const sqlUser = 'select id, userName, account from user where id in (?)'
    db.query(sqlUser, [idList], (err, userResult)=>{
      if(err) return res.cc(err)
      
      // 将用户信息转换为一个对象，以用户ID为键
      const userMap = {};
      userResult.forEach(user => {
        userMap[user.id] = user;
      });

      // 将用户信息合并到日志结果中
      const combinedResult = logResult.map(log => {
        const user = userMap[log.userId];
        return {
          ...log, // 保留日志信息
          userName: user ? user.userName : null, // 添加用户名
          account: user ? user.account : null, // 添加账号
          loginTime: moment(log.loginTime).format('YYYY-MM-DD HH:mm:SS'),
          logoutTime: moment(log.logoutTime).format('YYYY-MM-DD HH:mm:SS'),
        };
      });

      // 返回合并后的结果
      res.send({
        status: 200,
        desc: '获取登录日志成功',
        data: {
          list: combinedResult,
          total: combinedResult.length
        }
      });
    })
  })

}

//删除一条日志
exports.delLoginLog = (req, res)=>{
  const { logId, adminId } = req.body

  const sqlDel = 'delete from logindata where id = ?'
  db.query(sqlDel, logId, (err,result)=>{
    if(err) return res.cc(err)
    res.cc('删除成功',200)
  })

}