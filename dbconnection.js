function connectDatabase() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'visitors'
  });

  connection.connect((err) => {
    if(err){
      console.log('Database connection error');
    }else{
      console.log('Database connection successful');
    }
  });

  connection.query('SELECT * FROM visitors', (error, results, fields) => {
    if (error) {
      return console.log("An error occurred with the query", error);
    }
    console.log('The solution is: ', results[0].Fname);
  });

  connection.end(err => console.log("Connection successfully closed"));

}
