const db = require('../db/index.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

//登录
exports.login = (req, res)=>{
  const userInfo = req.body
  if(!userInfo.account||!userInfo.pwd) {
    return res.cc('账号密码不能为空')
  }
  if(!userInfo.role) {
    return res.cc('登录失败') 
  }
  const sqlsearch = `select * from user where account=?`
  db.query(sqlsearch, userInfo.account, (err, result)=>{
    if(err) return res.cc(err)
    if(result.length!==1) return res.cc('没有该账号')
    const compareResult = bcrypt.compareSync(userInfo.pwd, result[0].pwd)
    if(!compareResult) return res.cc('登录失败')
    //角色与登录网站不一致
    if(result[0].role!==userInfo.role){
      if(userInfo.role===1) {
        return res.cc('请前往用户端登录', 304)
      } else if(userInfo.role===2) {
        return res.cc('请前往销售后台端登录', 304)
      } else if(userInfo.role===3) {
        return res.cc('请前往后台管理端登录', 304)
      }
    }
    //登录成功 生产Token
    const user = {...result[0], pwd:''}
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.expiresIn})
    res.send({
      status: 200,
      message: '登录成功',
      data: {
        id: result[0].id,
        account: result[0].account,
        userName: result[0].userName,
        balance: result[0].balance,
        token: 'Bearer '+ tokenStr
      }
    })
  })
}

//注册
exports.register = (req, res)=>{
  const userInfo = req.body
  if(!userInfo.account||!userInfo.userName||!userInfo.pwd||!userInfo.role) {  //检查信息是否为空
    return res.cc('字段不能为空')
  }
  //查询是由有同名账号
  const sqlcheck = 'select * from user where account=?'
  db.query(sqlcheck, userInfo.account, (err, result)=>{  
    console.log(result);
    if(err) return res.cc(err)
    if(result.length>0) { 
      return res.cc('该账号已被注册')
    }
    userInfo.pwd = bcrypt.hashSync(userInfo.pwd, 10)  //将密码转换为哈希值
    const sqlinsert = 'insert into user set ?'  //定义插入user表的语句
    db.query(sqlinsert, {...userInfo, balance:100000}, (err,result)=>{
      if(err) return res.cc(err)
      if(result.affectedRows!==1) return res.cc('注册失败')
      res.cc('注册成功', 200)
    })
  })
}