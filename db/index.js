const mysql = require('mysql2')

const db = mysql.createPool({
  // host: '8.134.124.55',
  host: 'localhost',
  user:'root',
  password:'159357',
  database:'shopping-data'
})

module.exports = db