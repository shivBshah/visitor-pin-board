
let dataHandler = {
  populateData: function(conn,queryString) {
    let query = `SELECT * FROM VISITORS WHERE '1'='1'` + queryString + ` ORDER BY visitor_id DESC`;
     let display = "<tbody>";
      console.log(query);
     conn.query(query, function(err, rows, fields){
         if (err) throw err;
         let totalNumber = 0;
         for (let visitor of rows) {
           display += "<tr>";
           display += "<td><input type='checkbox'></td>";
           display += "<td>" + visitor.visitor_id + "</td>";
           display += "<td>" + visitor.date_visited.toISOString().substring(0, 10) + "</td>";
           display += "<td>" + visitor.email + "</td>";
           display += "<td>" + visitor.home_city + "</td>";
           display += "<td>" + visitor.home_state + "</td>";
           display += "<td>" + visitor.zip_code + "</td>";
           display += "<td>" + visitor.country + "</td>";
           display += "<td>" + visitor.destination + "</td>";
           //display += "<td>" + visitor.DestState + "</td>";
           display += "<td>" + visitor.travel_reason + "</td>";
           display += "<td>" + visitor.number + "</td>";
           display += "<td>" + visitor.advertisement + "</td>";
           display += "<td>" + visitor.hotel_stay + "</td>";
          // display += "<td>" + visitor.Date + "</td>";
           display += "</tr>";
         }
         if (rows.length == 0){
           display += "<tr> <td colspan='14' rowspan='3' style=' font-size: 20px;'>No records found</td></tr>";
         }
         display += "</tbody>";

        let newQuery = `SELECT SUM(number) s FROM visitors WHERE '1'='1' ` + queryString;
        conn.query(newQuery, (err,results,fields)=>{
            if (err) throw err;
            document.getElementById("recordSummary").innerHTML = results[0].s + " vistors from " + rows.length + " records";
         });

         let table = document.getElementById('visitorTable');

         if (table.childNodes.length >= 4) {
           table.removeChild(table.lastChild);
         }
          table.innerHTML += display;
           let dataRows = table.querySelectorAll("tbody tr");
           //console.log(dataRows[0].childNodes[0].firstChild);
           for (let row of dataRows){
               row.addEventListener("click", ()=>{
                 if(!row.childNodes[0].firstChild.checked){
                   row.style.backgroundColor = "#4C77A1";
                   row.style.color = "white";
                 }
                 else{
                   row.style.backgroundColor = "white";
                   row.style.color = "black";
                 }
                 row.childNodes[0].firstChild.checked = !row.childNodes[0].firstChild.checked;
            });
           }
       });
  },
  addData: function(conn, data){
    console.log(data);
    conn.query("INSERT INTO visitors(date_visited, email, home_city, home_state,zip_code,country, destination,travel_reason,number,advertisement,hotel_stay) VALUES(?,?,?,?,?,?,?,?,?,?, ?)", data, (err,results,fields)=>{
        if(err) {
          console.log("error adding visitors");
          //throw err;
        }else
          console.log("record added successfully");
    });
  },
  addMarker: function(conn, date){
    console.log('addMarker:' +  date);
    conn.query("INSERT INTO markers(timestamp) VALUES(?)", date, (err,results,fields)=>{
        if(err) {
          console.log("error adding marker");
          //throw err;
        }else
          console.log("marker added successfully");
    });
  },
  deleteData: function(conn, dataToDelete){
    for (data of dataToDelete){
      conn.query(`delete from visitors where visitor_id = '${data}'`, (error, results, fields) => {
        if (error) throw error;
        console.log('record deleted');
      });
    }
  },
  deleteMarker: function(conn, dataToDelete){
    for (data of dataToDelete){
      conn.query(`delete from markers where marker_id = '${data}'`, (error, results, fields) => {
        if (error) throw error;
        console.log('marker deleted');
      });
    }
  },
  updateData: function(conn, key, newData){
    conn.query(`UPDATE visitors SET email=?, home_city=?, home_state=?, zip_code=?, country = ?, destination=?, travel_reason=?, number=?, advertisement=?, hotel_stay=? where visitor_id="${key}"`, newData, (err,results,fields)=>{
      if (err) throw err;
      console.log('record updated successfully');
    });
  }
  ,
  fetchData: function(conn, queryString, callback){
    let results = [];
    conn.query(queryString, (err,rows,fields)=>{
      if(err) throw error;
      console.log("value",rows[0].number_of_markers);
      results = rows;
      callback(rows);
    });
    console.log(results);
  }
};


module.exports = dataHandler;
