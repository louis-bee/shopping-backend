const db = require('../db/index.js')

const actionLoger = {
  log(ip, message, type, role = -1, userId = -1) {
    const now = new Date(); // 当前时间
    const data = {
      ip,
      userId,
      role,
      message,
      type,
      time: now,
    }
    const sqlInsert = 'insert into actionData set ?'
    db.query(sqlInsert, data)
  }
}

module.exports = actionLoger