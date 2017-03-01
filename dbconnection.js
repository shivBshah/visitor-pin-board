
window.onload = function(){
function dbConnection() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'cvbdb.cn0cpun8b1mz.us-west-2.rds.amazonaws.com',
    user     : 'dbmaster',
    password : 'CSCI4060',
    database : 'CVBDB'
  });
  return connection;
}

  var connection = dbConnection();
  connection.connect();
  console.log("here");
  var queryString = 'SELECT * FROM VISITOR';
   var display = "";
    connection.query(queryString, function(err, rows, fields){
      console.log(rows.length);
      if (err) throw err;
      for (var visitor of rows) {
        display += "<tr>";
        display += "<td>" + visitor.Fname + "</td>";
        display += "<td>" + visitor.Lname + "</td>";
        display += "<td>" + visitor.Email + "</td>";
        display += "<td>" + visitor.HomeCity + "</td>";
        display += "<td>" + visitor.HomeState + "</td>";
        display += "<td>" + visitor.Zipcode + "</td>";
        display += "<td>" + visitor.DestCity + "</td>";
        display += "<td>" + visitor.DestState + "</td>";
        display += "<td>" + visitor.NumInParty + "</td>";
        display += "<td>" + visitor.TravelingFor + "</td>";
        display += "<td>" + visitor.Hotel + "</td>";
        display += "<td>" + visitor.HearAboutCVB + "</td>";
        display += "<td>" + visitor.Date + "</td>";
        display += "</tr>";
      }
      document.getElementById('visitors').innerHTML = document.getElementById('visitors').innerHTML + display;
      console.log(display);
    });
    connection.end((err) =>{

    });
}
