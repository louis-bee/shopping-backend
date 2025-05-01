const db = require('../db/index.js')
const ms = require('ms'); // 引入 ms 模块
const { expiresIn } = require('../config.js')

const loginLoger = {
  login(ip, userId, role) {
    const now = new Date(); // 当前时间
    const expireMs = ms(expiresIn); // 将 expiresIn 转换为毫秒数
    const expireTime = new Date(now.getTime() + expireMs); // 计算过期时间
    const data = {
      ip,
      userId,
      role,
      loginTime: now,
      logoutTime: expireTime,
    }
    const sqlInsert = 'insert into logindata set ?'
    db.query(sqlInsert, data)
  },

  logout(userId, ip) {
    // 找到最新的一条登录信息，将登出时间更新到表中
    const now = new Date(); // 当前时间
    const sqlFindLatestLogin = `
      SELECT id
      FROM logindata
      WHERE userId = ?
      ORDER BY loginTime DESC
      LIMIT 1
    `;
    db.query(sqlFindLatestLogin, [userId], (err, result) => {
      if (err) {
        console.log('Error finding latest login:', err.message);
        return;
      }
      if (result.length === 0) {
        console.log('No login record found for user:', userId);
        return;
      }
      const latestLoginId = result[0].id; // 获取最新登录记录的 ID
      const sqlUpdateLogoutTime = `
        UPDATE logindata
        SET logoutTime = ?, ip = ?
        WHERE id = ?
      `;
      
      db.query(sqlUpdateLogoutTime, [now, ip, latestLoginId], (err, result) => {
        if (err) {
          console.log('Error updating logout time:', err.message);
        } else {
          console.log('Logout time updated successfully:', result);
        }
      });
    });
  },

  refresh(userId, ip) {
    // 找到最新的一条登录信息，将登出时间更新到表中
    const now = new Date(); // 当前时间
    const expireMs = ms(expiresIn); // 将 expiresIn 转换为毫秒数
    const expireTime = new Date(now.getTime() + expireMs); // 计算过期时间
    const sqlFindLatestLogin = `
      SELECT id
      FROM logindata
      WHERE userId = ?
      ORDER BY loginTime DESC
      LIMIT 1
    `;
    db.query(sqlFindLatestLogin, [userId], (err, result) => {
      if (err) {
        console.log('Error finding latest login:', err.message);
        return;
      }
      if (result.length === 0) {
        console.log('No login record found for user:', userId);
        return;
      }
      const latestLoginId = result[0].id; // 获取最新登录记录的 ID
      const sqlUpdateLogoutTime = `
        UPDATE logindata
        SET logoutTime = ? , ip = ?
        WHERE id = ?
      `;
      
      db.query(sqlUpdateLogoutTime, [expireTime, ip, latestLoginId], (err, result) => {
        if (err) {
          console.log('Error updating logout time:', err.message);
        } else {
          console.log('Logout time updated successfully:', result);
        }
      });
    });
  }

}

module.exports = loginLoger