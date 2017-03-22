
'use strict';

class dbconnection {

  getConnection() {
    const hostName = 'cvbdb.cn0cpun8b1mz.us-west-2.rds.amazonaws.com';//'localhost',;
    const userName = 'dbmaster';//'root',;
    const pass = 'CSCI4060';
    const dbName = 'CVBDB';
    let mysql      = require('mysql');
    var conn = mysql.createConnection({
      host     : hostName,
      user     : userName,
      password : pass,
      database : dbName
    });
    return conn;
  }

  endConnection() {
    conn.endConnection((err)=>{

    });
  }
}

module.exports = dbconnection;
