function dbConnection() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost', //'cvbdb.cn0cpun8b1mz.us-west-2.rds.amazonaws.com',
    user     : 'root',//'dbmaster',
    password : 'root',//'CSCI4060',
    database : 'visitors'
  });
 return connection;
}
