
function dbConnection() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'hd6520g',
    database : 'visitors'
  });
 return connection;
}
