const mysql = require('mysql2')

const db = mysql.createPool({
  host: '127.0.0.1',
  user:'root',
  password:'159357',
  database:'shopping-data'
})

module.exports = db