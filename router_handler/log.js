const db = require('../db/index.js')
const moment = require('moment')
const actionLoger = require('../utils/actionLoger.js')

//获取登录日志
exports.getLoginLogList = (req, res)=>{
  const { adminId, search, role } = req.body
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
      //日志
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        actionLoger.log(ip, `查询登录日志列表`, 1, 3, adminId)
      } catch {}
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
    //日志
    try {
      const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
      actionLoger.log(ip, `删除登录日志${logId}`, 4, 3, adminId)
    } catch {}
    res.cc('删除成功',200)
  })

}

//获取操作日志
exports.getActionLogList = (req, res)=>{
  const { adminId, search, role, type } = req.body
  // 初始化查询语句和参数数组
  let sqlGetList = 'SELECT * FROM actiondata WHERE 1=1';
  const params = [];
  // 根据参数是否为空动态添加条件
  if (search) {
    sqlGetList += ' AND userId = ?';
    params.push(search);
  }
  if (role) {
    sqlGetList += ' AND role = ?';
    params.push(role);
  }
  if (type) {
    sqlGetList += ' AND type = ?';
    params.push(type);
  }
  // 添加排序
  sqlGetList += ' ORDER BY id DESC';

  db.query(sqlGetList, params, (err, result)=>{
    if(err) return res.cc(err)
    // 返回合并后的结果
    res.send({
      status: 200,
      desc: '获取操作日志成功',
      data: {
        list: result.map(item=>{
          return {
            ...item,
            time: moment(item.time).format('YYYY-MM-DD HH:mm:SS')
          }
        }),
        total: result.length
      }
    });
  })

}

//删除一条日志
exports.delActionLog = (req, res)=>{
  const { actionId, adminId } = req.body

  const sqlDel = 'delete from actiondata where id = ?'
  db.query(sqlDel, actionId, (err,result)=>{
    if(err) return res.cc(err)
    res.cc('删除成功',200)
  })

}