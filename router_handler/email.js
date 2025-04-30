const db = require('../db/index')
const emailCtrl = require('../utils/email.js'); //引入封装好的函数
const { codeStore } = require('../utils/store');

//发送验证码
exports.sendCode = (req, res)=>{
  console.log(codeStore);

  const { email, userId } = req.body
	if (!email) {
		return res.cc('邮箱格式错误')
	} //email出错时或者为空时
	const code = parseInt(Math.random(0, 1) * 100000) //生成随机验证码
  const now = new Date()
	//发送邮件

	//清理过期验证码
	codeStore = codeStore.filter(item =>{
		(now - item.time)/(1000*60) > 60 //大于60分钟 
	})

	emailCtrl.sendMail(email, code, (state) => {
		if (state) {
      codeStore[email] = { code, time: now, userId }
      console.log(codeStore);
      
			return res.send({
        status: 200,
        desc: '验证码已发送',
      })
		} else {
			return res.cc("发送失败")
		}
	})
}