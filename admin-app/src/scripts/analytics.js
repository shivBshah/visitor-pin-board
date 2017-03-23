window.onload = function(){
  document.querySelector("button[type='submit']").addEventListener('click', (e)=>{
    e.preventDefault();
    let method = document.getElementById('method').value;
    let criteria = document.getElementById('criteria').value;
    let queryString = '';

    if(criteria == 'State'){
      queryString = `select HomeState, count(*) as Count from visitor group by HomeState order by Count desc`;
    }
    else if(criteria == 'City'){
      queryString = `select HomeCity, count(*) as Count from visitor group by HomeCity order by Count desc`;
    }

    buildTable(criteria,queryString);
  });
};

function buildTable(criteria, queryString){
  let conn = dbConnection();
  let display = `<thead>
                  <tr>
                    <th>${criteria}</th>
                    <th>Number of Visitors</th>
                    <th>Percentage</th>
                  </tr>
                </thead>`;
  conn.connect(function(err){
    if(err) throw error;
    conn.query(queryString, function(err, rows, fields){
        if (err) throw err;
        display += "<tbody>";
        for (let visitor of rows) {
          display += "<tr>";
          let cln = visitor.HomeCity || visitor.HomeState;
          display += "<td>" + cln + "</td>";
          display += "<td>" + visitor.Count+ "</td>";
          display += "<td>" + "</td>";
          display += "</tr>";
        }
        display += "</tbody>";
        document.getElementById('analyticsTable').innerHTML = display;
        conn.end((err)=>{

        });
    });
  });

}
