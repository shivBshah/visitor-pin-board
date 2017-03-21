
function dbConnection() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'cvbdb.cn0cpun8b1mz.us-west-2.rds.amazonaws.com',//'localhost',
    user     : 'dbmaster',//'root',
    password : 'CSCI4060',
    database : 'CVBDB'
  });
 return connection;
}
