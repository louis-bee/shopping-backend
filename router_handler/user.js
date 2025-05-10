const db = require('../db/index.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const emailCtrl = require('../utils/email.js'); //引入封装好的函数
const { adminCodeStore } = require('../utils/store');
const loginLoger = require('../utils/loginLoger.js')

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
    if(result[0].status === 2) return res.cc('该账号已注销')
    const compareResult = bcrypt.compareSync(userInfo.pwd, result[0].pwd)
    if(!compareResult) return res.cc('登录失败')
    //角色与登录网站不一致
    if(result[0].role!==userInfo.role){
      if(result[0].role===1) {
        return res.cc('请前往用户端登录', 304)
      } else if(result[0].role===2) {
        return res.cc('请前往销售后台端登录', 304)
      } else if(result[0].role===3) {
        return res.cc('请前往后台管理端登录', 304)
      }
    }
    //登录成功 生产Token
    const user = {...result[0], pwd:''}
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.expiresIn})
    const refreshTokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.longExpiresIn})

    try {
      const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
      loginLoger.login(ip, result[0].id, userInfo.role)
    } catch {}

    res.send({
      status: 200,
      desc: '登录成功',
      data: {
        id: result[0].id,
        account: result[0].account,
        userName: result[0].userName,
        balance: result[0].balance,
        token: 'Bearer '+ tokenStr,
        refreshToken: 'Bearer ' + refreshTokenStr,
      }
    })
  })
}

//注册
exports.register = (req, res)=>{
  const userInfo = req.body.userInfo
  if(!userInfo.account||!userInfo.userName||!userInfo.pwd||!userInfo.role) {  //检查信息是否为空
    return res.cc('字段不能为空')
  }

  if(userInfo.role===3) {
    //管理员注册 验证注册许可
    const code = req.body.code
    if(!code) return res.cc('注册许可不能空')
    
    //验证是否正确
    if(!adminCodeStore[userInfo.account] || adminCodeStore[userInfo.account].code!==parseInt(code)) return res.cc("注册许可错误")
    //2.是否过期
    const timeGap = (new Date() - adminCodeStore[userInfo.account].time)/1000
    if(timeGap>60*60) return res.cc("验证码已过期")
  }

  //查询是由有同名账号
  const sqlcheck = 'select * from user where account=?'
  db.query(sqlcheck, userInfo.account, (err, result)=>{  
    if(err) return res.cc(err)
    if(result.length>0) { 
      if(userInfo.role===3) delete adminCodeStore[userInfo.account]
      return res.cc('该账号已被注册')
    }
    userInfo.pwd = bcrypt.hashSync(userInfo.pwd, 10)  //将密码转换为哈希值
    const sqlinsert = 'insert into user set ?'  //定义插入user表的语句
    db.query(sqlinsert, {...userInfo, balance:100000}, (err,result)=>{
      if(err) return res.cc(err)
      if(result.affectedRows!==1) return res.cc('注册失败')
      if(userInfo.role===3) delete adminCodeStore[userInfo.account]
      res.cc('注册成功', 200)
    })
  })
}

//注销
exports.logout = (req, res)=>{
  const userId = req.body.id
  if(!userId) {
    return res.cc('字段不能为空')
  }
  //日志操作
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    loginLoger.logout(userId, ip)
  } catch {

  }
  res.send({
    status: 200,
    desc: '登出成功',
  })
}

//刷新token
exports.refreshToken = (req, res)=>{
  const refreshToken = req.body.refreshToken
  const userId = req.body.userId
  //1.验证长token是否过期
  try {
    jwt.verify(refreshToken.split(' ')[1], config.jwtSecretKey);
    //2.生产Token
    const sqlsearch = `select * from user where id=?`
    db.query(sqlsearch, userId, (err, result)=>{
      if(err) return res.cc(err)
      if(result.length!==1) return res.cc('没有该账号')
      const user = {...result[0], pwd:''}
      const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.expiresIn})
      const refreshTokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.longExpiresIn})

      //登录日志跟新
      try {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        loginLoger.refresh(userId, ip)
      } catch {
    
      }

      res.send({
        status:200,
        desc:'token刷新成功',
        data: {
          token: 'Bearer '+ tokenStr,
          refreshToken: 'Bearer ' + refreshTokenStr,
        }
      })

    })
  } catch (error) {
    return res.cc('登录已过期', 402);
  }
}

//发送管理员账号申请
exports.sendAdminCode = (req, res)=>{
  console.log(adminCodeStore);
  const { account, userName } = req.body
	if (!userName || !account) {
		return res.cc('参数不能为空')
	}

	//验证账号是否重复
	const sqlSearch = 'select * from user where account = ?'
	db.query(sqlSearch, account, (err,result)=>{
		if(err) return res.cc('数据库查询错误')
		if(result.length>0) { 
			return res.cc('该账号已被注册')
		} else {
			const code = parseInt(Math.random(0, 1) * 10000000) //生成随机验证码
			const now = new Date()
		
			//清理过期验证码
      for (const key in adminCodeStore) {
        if ((now - adminCodeStore[key].time) / (1000 * 60) > 60) { //大于60分钟 
          delete adminCodeStore[key];
        }
      }
		
			emailCtrl.sendAdminMail(account, userName, code, (state) => {
				if (state) {
					adminCodeStore[account] = { code, time: now, account }
					console.log(adminCodeStore);
					
					return res.send({
						status: 200,
						desc: '验证码已发送',
					})
				} else {
					return res.cc("发送失败")
				}
			})
		}
	})
}