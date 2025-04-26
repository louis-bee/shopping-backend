const port = 3009;
const express = require('express');
const path = require('path')
const app = express();

//cors中间件
const cors = require('cors')
app.use(cors())

// 使用 body-parser 中间件解析 JSON 格式的数据
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//解析表单数据的中间件
app.use(express.urlencoded({extended:false}))

//history
// 服务静态文件
// app.use(express.static(path.join(__dirname, 'public')));  // 确保这是你的构建输出目录，例如'build'或'dist'

// // 捕获所有路由，返回index.html，让React Router接管路由
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));  // 确保这是你的入口HTML文件的位置
// });

// 配置静态文件目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//在路由前封装res.cc
app.use((req,res,next)=>{
  res.cc = function(err, status=500) {
    res.send({
      status,
      desc: err instanceof Error ? err.message : err
    })
  }
  next()
})

//在路由前配置解析token的中间件
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({
  path: [/^\/api/, /^\/getGoods/] //定义不需要进行身份验证的请求前缀
}));

//用户路由模块
const userRouter =  require('./router/user')
app.use('/api', userRouter)

//get商品路由模块
const getGoodsRouter =  require('./router/getGoods')
app.use('/getGoods', getGoodsRouter)

//商品路由模块
const manageGoodsRouter =  require('./router/manageGoods')
app.use('/manageGoods', manageGoodsRouter)

//购物车路由模块
const cartRouter =  require('./router/cart')
app.use('/cart', cartRouter)

//图片上传路由模块
const uploadRouter =  require('./router/upload')
app.use('/upload', uploadRouter)


//使用全局错误处理中间件
app.use((err, req, res, next) => {
  // 这次错误是由 token 解析失败导致的
  if (err.name === "UnauthorizedError") {
    return res.send({
      status: 401,
      desc: "登录已过期",
    });
  }
  res.send({
    status: 500,
    desc: "未知的错误",
  });
});

app.listen(port, () => {
  console.log(`shopping-backend listening on port ${port}`);
});