const db = require('../db/index.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

//获取用户列表
exports.getUserList = (req, res)=>{
  const { pageNum, pageSize, search, role, userId } = req.body
  const startIndex = (pageNum-1)*pageSize
  //待优化：校验用户是否为管理员

  if(search) {
    const sqlSearch = 'select * from user where id = ? or userName = ? or account = ?'
    db.query(sqlSearch, [search, search, search], (err, searchResult)=>{
      if(err) return res.cc(err)
      if(searchResult.length>0) {
        const list = searchResult
        res.send({
          status: 200,
          desc: '查询成功',
          data: {
            total: searchResult.length,
            list: list.map(item=>{
              return {
                ...item,
                pwd2: item.pwd
              }
            })
          }
        })
      } else {
        res.send({
          status: 200,
          desc: '查询成功',
          data: {
            list: []
          }
        })
      }
    })
  } else {
    //按角色分页查询
    const sqlSearch = 'select * from user where role = ?'
    db.query(sqlSearch, role, (err, searchResult)=>{
      if(err) return res.cc(err)
      if(searchResult.length>0) {
        const list = searchResult
        res.send({
          status: 200,
          desc: '查询成功',
          data: {
            total: searchResult.length,
            list: list.map(item=>{
              return {
                ...item,
                pwd2: item.pwd
              }
            })
          }
        })
      } else {
        res.send({
          status: 200,
          desc: '查询成功',
          data: {
            list: []
          }
        })
      }
    })
  }

}

exports.delUser = (req, res)=>{
  const { adminId, userId } = req.body
  //待优化：校验用户是否为管理员

  const sqlDel = 'update user set status=2 where id = ?'
  db.query(sqlDel, userId, (err, result)=>{
    if(err) res.cc(err)
    res.cc('删除成功',200)
  })

}

exports.editUser = (req, res)=>{
  const { adminId, userInfo } = req.body
  //待优化：校验用户是否为管理员

  if(userInfo.id) {
    const sqlcheck = 'select * from user where id=?'
    db.query(sqlcheck, userInfo.id, (err, checkResult)=>{ 
      if(err) res.cc(err)
      if(checkResult[0].pwd===userInfo.pwd) {
        const sqlEdit1 = 'update user set userName = ?, balance = ? where id = ?'
        db.query(sqlEdit1, [ userInfo.userName, userInfo.balance, userInfo.id], (err, result)=>{
          if(err) res.cc(err)
          res.cc('账号信息已更新',200)
        })
      } else {
        userInfo.pwd = bcrypt.hashSync(userInfo.pwd, 10)  //将密码转换为哈希值
        const sqlEdit2 = 'update user set pwd = ? , userName = ?, balance = ? where id = ?'
        db.query(sqlEdit2, [userInfo.pwd, userInfo.userName, userInfo.balance, userInfo.id], (err, result)=>{
          if(err) res.cc(err)
          res.cc('账号信息已更新',200)
        })
      }
     })
    
  } else {
    const sqlcheck = 'select * from user where account=?'
    userInfo.pwd = bcrypt.hashSync(userInfo.pwd, 10)  //将密码转换为哈希值
    db.query(sqlcheck, userInfo.account, (err, result)=>{  
      if(err) return res.cc(err)
      if(result.length>0) { 
        return res.cc('账号名重复')
      }
      const sqlinsert = 'insert into user set ?'  //定义插入user表的语句
      delete userInfo.id
      
      db.query(sqlinsert, {...userInfo}, (err,result)=>{
        if(err) return res.cc(err)
        if(result.affectedRows!==1) return res.cc('添加失败')
        res.cc('账号已添加', 200)
      })
    })
  }

}