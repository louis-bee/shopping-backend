const nodemailer = require('nodemailer'); //引入模块
let transporter = nodemailer.createTransport({
    //node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
	service: 'qq', //类型qq邮箱
	port: 3010,
	secure: true, // true for 465, false for other ports
	auth: {
		user: '2720447678@qq.com', // 发送方的邮箱
		pass: 'thtrmagnfhcadheh' // smtp 的授权码
	}
});
//pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
//邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码

function sendMail(mail, code, call) {
	// 发送的配置项
	let mailOptions = {
		from: '"路易斯商城" <2720447678@qq.com>', // 发送方
		to: mail, //接收者邮箱，多个邮箱用逗号间隔
		subject: '支付验证码', // 标题
		// text: '', // 文本内容
		html: `<div>下面是你的验证码：<h3>${code}</h3><p>请勿将验证码告诉其他人！！！</p></div>`, //页面内容
		// attachments: [{//发送文件
		// 		filename: 'index.html', //文件名字
		// 		path: './index.html' //文件路径
		// 	},
		// 	{
		// 		filename: 'sendEmail.js', //文件名字
		// 		content: 'sendEmail.js' //文件路径
		// 	}
		// ]
	};

	//发送函数
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			call(false)
		} else {
			call(true) //因为是异步 所有需要回调函数通知成功结果
		}
	});

}

module.exports = {
	sendMail
}