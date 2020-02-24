const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.get('', (req, res) => {
  fs.readFile(path.join(__dirname, './data.json'), 'utf8', (err, data) => {
    if (err) throw err
    console.log(data)
    res.send(data)
  })
})
app.listen(8002, () => {
  console.log(`当前服务器启动成功 http://127.0.0.1:8002`)
})
