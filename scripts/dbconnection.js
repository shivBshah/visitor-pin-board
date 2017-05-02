
let mysql  = require('mysql');

class DBConnection {
    constructor() {
      this._connection = mysql.createConnection({
        host     : 'DESKTOP-ADT7E5D',
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
