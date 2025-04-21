const express = require('express');
const app = express();
const port = 3009;

//cors中间件
const cors = require('cors')
app.use(cors())

// 使用 body-parser 中间件解析 JSON 格式的数据
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//解析表单数据的中间件
app.use(express.urlencoded({extended:false}))

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

//用户路由模块
const userRouter =  require('./router/user')
app.use('/api', userRouter)

//商品路由模块
const goodsRouter =  require('./router/goods')
app.use('/goods', goodsRouter)


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