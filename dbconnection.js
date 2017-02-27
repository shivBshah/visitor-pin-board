
function dbConnection() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'visitors'
  });
 return connection;
  /*connection.connect((err) => {
    if(err){
      console.log('Database connection error');
    }else{
      console.log('Database connection successful');
      return connection;
    }
  });*/

}
