window.onload = function() {
  let printBtn = document.querySelector('button[name="print"]');
  printBtn.addEventListener('click', (e)=>{
    /*const{ipcRenderer} = require('electron');
    ipcRenderer.sendSync('print');*/
    const remote = require('electron').remote;
    remote.getCurrentWindow().webContents.print({silent:false, printBackground:true});
  });

  let submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    let queryString = buildQueryString();
    console.log(queryString);
    populateTable(queryString);
  });
};

function buildQueryString(){
  let fromDate = document.querySelectorAll('input[name="date"]')[0].value;
  let toDate = document.querySelectorAll('input[name="date"]')[1].value;
  let state = document.querySelector('select[name="state"]').value;

  let queryString = '';
  if(fromDate == '' && toDate == '' && state == ''){
    queryString = "select * from visitor";
  }
  else {
    if (fromDate == '' && toDate =='' && state != ''){
      queryString = `select * from visitor where HomeState = "${state}"`;
    }
    else if (fromDate != '' && toDate != '' && state == ''){
      queryString = `select * from visitor where Date between "${fromDate}" and "${toDate}"`;
    }
    else if (fromDate != '' && toDate != '' && state != ''){
      queryString = `select * from visitor where Date between "${fromDate}" and "${toDate}" and HomeState="${state}"`;
    }
  }
  return queryString;
}

function populateTable(queryString) {
   let connection = dbConnection();
   connection.connect();
   let display = "<tbody>";
   connection.query(queryString, function(err, rows, fields){
       if (err) throw err;
       for (let visitor of rows) {
         display += "<tr>";
         console.log(visitor.Date);
         display += "<td>" + visitor.visitor_id + "</td>";
         display += "<td>" + visitor.Fname + "</td>";
         display += "<td>" + visitor.Lname + "</td>";
         display += "<td>" + visitor.Email + "</td>";
         display += "<td>" + visitor.HomeCity + "</td>";
         display += "<td>" + visitor.HomeState + "</td>";
         display += "<td>" + visitor.Zipcode + "</td>";
         display += "<td>" + visitor.DestCity + "</td>";
         display += "<td>" + visitor.DestState + "</td>";
         display += "<td>" + visitor.TravelingFor + "</td>";
         display += "<td>" + visitor.NumInParty + "</td>";
         display += "<td>" + visitor.HearAboutCVB + "</td>";
         display += "<td>" + visitor.Hotel + "</td>";
        // display += "<td>" + visitor.Date + "</td>";
         display += "</tr>";
       }
       display += "</tbody>";
       let info = ''+rows.length+' records found.';
       document.getElementById('recordInfo').innerHTML = info;
       document.querySelector('.alert').classList.toggle('alert-info',true);

       let table = document.getElementById('visitorTable');

       if (table.childNodes.length >= 4) {
         let childs = table.childNodes;
         table.removeChild(childs[childs.length-1]);
       }
       document.getElementById('visitorTable').innerHTML = document.getElementById('visitorTable').innerHTML + display;
     });

     connection.end((err) =>{

     });
}
