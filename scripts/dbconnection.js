
let mysql  = require('mysql');

class DBConnection {
    constructor() {
      this._connection = mysql.createConnection({
        host     : '10.26.127.123',
        user     : 'root',
        password : 'root',
        database : 'visitors'
      });
   }

   connect() {
      this._connection.connect((err) => {
          if(err){
            console.log(err);
          } else{
            console.log('Database connection successful');
          }
      });
      return this._connection;
   }
}

module.exports = DBConnection;
