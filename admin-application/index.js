let dataHandler = require('./scripts/data-table.js');
let DBConnection = require('./scripts/db-connection.js');

let conn = (function() {
    let db = new DBConnection();
    return db.connect();
})();

let clicked = false;
loadGraphs();
// document.addEventListener('click', ()=>{
//     console.log(clicked);
//     clicked = true;
//     console.log(clicked);
// });
//
// let myVar = setTimeout(function listen(){
//    if (clicked){
//      clicked = false;
//    }
//    else{
//      console.log("reload");
//      clicked = true;
//    }
//    setTimeout(listen, 5000);
// }, 5000);

let tabs = document.getElementsByTagName("li");
const tabPages = ['dashboard', 'database', 'constant-contact', 'summary', 'settings'];
let contentPages = document.getElementsByClassName('content');
for(let i = 0; i < tabs.length-1; i++){
  tabs[i].addEventListener('click', ()=>{
      document.querySelector("#title p").innerHTML = tabs[i].childNodes[0].textContent;
      if (!tabs[i].classList[0]){
        tabs[i].classList.add("active");
        contentPages[i].style.display = "block";
        for (let j = 0; j < contentPages.length; j++){
          if (j!=i){
            contentPages[j].style.display = "none";
          }
        }
        //document.getElementById("content").src = './views/' + tabPages[i];
        for (let j = 0; j < tabs.length; j++){
          if (tabs[i] !== tabs[j]){
                tabs[j].classList.remove("active");
          }
        }
        loadContents(contentPages[i]);
      }
  });
}

function loadContents(contentPage){
  console.log(contentPage.id);
  console.log((new Date()).toISOString().substring(0, 10));
  let id = contentPage.id;
  //define actions for database page
  if (id == 'database'){
    let panel = contentPage.querySelector("a[role='button']");
    panel.onclick = ()=>{
       if(panel.classList[0] != 'expanded')
         panel.classList.add('expanded');
       else {
         contentPage.querySelector("#visitorTable").style.maxHeight = "580px";
         console.log("panel");
         panel.classList.remove('expanded');
       }
    };

    let table = contentPage.querySelector("#visitorTable");
    let baseQuery = "";
    dataHandler.populateData(conn, baseQuery);

    // listenCheckboxes(databasePage);
    contentPage.querySelector("#filter").addEventListener('click', ()=>{
      let form = contentPage.querySelector("#database .form");
      createQueryString(form, dataHandler.populateData);
    });
    contentPage.querySelector('#clear').addEventListener('click', ()=>{
      contentPage.querySelector(".form").reset();
      dataHandler.populateData(conn, baseQuery);

    });

    contentPage.querySelector('#add').onclick = ()=>{
      $('#formModal').modal('show');
      let inputs = contentPage.querySelector('#vform').elements;
      for (input of inputs){
        input.value = "";
      }
      let modal = contentPage.querySelector("#formModal");
      modal.querySelector("h3").innerHTML = "Add new record";
      modal.querySelector(".modal-footer #save-button").innerHTML = "Add";
      contentPage.querySelector("#formModal .modal-footer #save-button").onclick = ()=>{

        $('#formModal').modal('hide');
        let data = [];
        data.push((new Date()).toISOString().substring(0, 10));
        for (input of inputs)
        {
          if(input.type == 'number'){
              if(input.value == ''){
                data.push('1');
              }else {
                data.push(input.value);
              }
          }
          else {
            if(input.value != 'Select')
              data.push(input.value);
          }
        }

        dataHandler.addData(conn, data);
        // dataHandler.addMarker(conn, data[0]); //add new marker with just the date
        dataHandler.populateData(conn, baseQuery);
      };
    };

    contentPage.querySelector('#edit').onclick = ()=>{
      let checkboxes = table.querySelectorAll("input[type='checkbox']");
      for (let c of checkboxes){
        if (c.checked){
             $('#formModal').modal('show');

             let modal = contentPage.querySelector("#formModal");
             let inputs = contentPage.querySelector('#vform').elements;

             modal.querySelector("h3").innerHTML = "Edit record";
             modal.querySelector(".modal-footer #save-button").innerHTML = "Update";
             let cols = c.parentNode.parentNode.childNodes;

             for (let i =0; i < inputs.length; ++i){
               inputs[i].value = cols[i+3].textContent;
             }

             contentPage.querySelector("#formModal .modal-footer #save-button").onclick = ()=>{
               $('#formModal').modal('hide');
               let newData = [];
               for (input of inputs)
               {
                 if(input.type == number){
                     if(input.value == '')
                        data.push('1');
                 }else {
                   if(input.value != 'Select')
                     newData.push(input.value);
                 }
               }
               dataHandler.updateData(conn, cols[1].textContent, newData);

               dataHandler.populateData(conn, baseQuery);
           };
           return;
        }
     }
   };

    contentPage.querySelector('#delete').onclick = ()=>{
      let checkboxes = table.querySelectorAll("input[type='checkbox']");
      for (let c of checkboxes){
        if (c.checked){
             $('#deleteModal').modal('show');
              contentPage.querySelector("#deleteModal .modal-footer #deleteRecord").onclick = ()=>{
              let rowsToDelete = [];
              for (let c of checkboxes){
                if (c.checked){
                  rowsToDelete.push(c.parentNode.nextSibling.textContent);
                }
              }
              $('#deleteModal').modal('hide');
              dataHandler.deleteData(conn, rowsToDelete);
              dataHandler.deleteMarker(conn, rowsToDelete);
              dataHandler.populateData(conn, baseQuery);
            };
            return;
        }
      }

     };

  }
  //define actions for settings page
  else if (id == 'settings') {
    let checkboxes = contentPage.querySelectorAll(".card-container input[type='checkbox']");
    for(let c of checkboxes){
      c.onclick = ()=>{
        c.parentNode.childNodes[5].disabled = !c.parentNode.childNodes[5].disabled;
      };
    }
    loadInitialSettings(checkboxes);
    contentPage.querySelector("#saveMapSettings").onclick = ()=>{
       saveMapSettings(checkboxes);
    };
    contentPage.querySelector("#resetToDefault").onclick = ()=>{
      resetMapSettings(checkboxes);
    };
  }
  //define actions for constant-contact page
  else if (id=="constant-contact") {
    loadPreviousExports(contentPage);//load previous exports for constant contact

    //add listener to export emails upon clicking the button
    let exportContactButton = contentPage.querySelector("#export-constant-contact");
    exportContactButton.onclick = function(){
      showDialog(exportEmailLists, contentPage);
    };
  }
  //define actions for dashboard page
  else if(id=="dashboard"){
    loadGraphs();
  }
  else if (id="summary"){
    contentPage.querySelector("#submit-summary").onclick = ()=>{
      let criteria = contentPage.querySelector("#criteria-sum").value;

      // if(!criteria){
      //   contentPage.querySelector("sum-error").innerHTML = "Please select a criteria";
      // }
      // else {
      let query =  buildSummaryQuery(contentPage);
      createSummaryTable(query);
      // }
    };

    contentPage.querySelector("#clear-summary").onclick = ()=>{
      clearSummaryPage(contentPage);
    };
  }
}

/*-------------------------------------------------------------------------
          SUMMARY PAGE FUNCTIONS SECTION
  -------------------------------------------------------------------------*/
function clearSummaryPage(contentPage){
  contentPage.querySelector("#summary-form").reset();
}

function buildSummaryQuery(contentPage){
  let criteriaBox = contentPage.querySelector("#criteria-sum");
  let criteria = criteriaBox.value;
  let columnHeader = criteriaBox.querySelector(`option[value='${criteria}']`).innerHTML;

  let dateFrom = contentPage.querySelector("#dateFrom-sum").value;
  let dateTo = contentPage.querySelector("#dateTo-sum").value;
  let travelReason= contentPage.querySelector("#travelReason-sum").value;
  let advertisement = contentPage.querySelector("#advertisement-sum").value;
  let hotelStay = contentPage.querySelector("#hotelStay-sum").value;
  let query = `SELECT SUM(number) AS Count FROM visitors WHERE '1'='1'`;
  let restQuery = ``;
  if(dateFrom){
    if(!dateTo){
      dateTo = (new Date()).toISOString().substring(0, 10);
    }
    restQuery += `AND date_visited BETWEEN "${dateFrom}" AND "${dateTo}"`;
  }

  if(travelReason != 'All'){
   restQuery += `AND travel_reason = "${travelReason}"`;
  }

  if(advertisement != 'All'){
    restQuery += `AND advertisement = "${advertisement}"`;
  }
  if(hotelStay != 'All'){
    restQuery += `AND hotel_stay = "${hotelStay}"`;
  }
  if (criteria != 'All'){
    query = `SELECT ${criteria} AS "${columnHeader}", SUM(number) AS Count FROM visitors WHERE '1'='1'`+restQuery+` GROUP BY ${criteria} ORDER BY Count DESC`;
  }
  else{
    query += restQuery+` ORDER BY Count DESC`;
  }
  return query;
}

function createSummaryTable(query){
  let display = "";
  display += "<div class='table-responsive'><table class='table table-striped'>";
  let exportData = [];
  conn.query(query, (err,results,fields)=>{
    if (err) throw err;
    display += "<thead><tr>";

    let headers = [];
    for(let field of fields){
      display += "<th>" + field.name + "</th>";
      headers.push(field.name);
    }
    exportData.push(headers);

    display += "</tr></thead>";
    display += "<tbody>"
    for(let result of results){
      display += "<tr>";
      let bodies = [];
      for(let field in result){
        bodies.push(result[field]);
        display += "<td>" + result[field] + "</td>";
      }
      exportData.push(bodies);
      display += "</tr>";
    }

    if (results.length == 0){
      display += "<tr><td colspan='14' rowspan='3' style=' font-size: 20px;'>No records found</td></tr>";
    }
    display += "</tbody>";
    display += "</table></div>";
    let table = document.getElementById('summaryTable');

     table.innerHTML = '<button id="export-summary" type="button" class="btn btn-primary">Export</button>'+display;

     document.getElementById("export-summary").onclick = ()=>{
        console.log("export");
        dialog.showSaveDialog({
           title: "Export as",
           filters: [{name: 'Excel(.xlsx)', extensions: ['xlsx']}],
           nameFieldLabel: "sample"
         }, function (file) {
          if (file === undefined) return;
          console.log("fileRead");
          let filePieces = file.split("\\");
          let fileName = filePieces[filePieces.length-1];
          let filePath = filePieces.splice(0,filePieces.length-1).join("\\");
          writeNowToExcel(fileName, filePath, exportData);
        });
     };
  });

}

/*-------------------------------------------------------------------------
          DASHBOARD PAGE FUNCTIONS SECTION
  -------------------------------------------------------------------------*/
function loadGraphs() {
  conn.query('SELECT home_state, SUM(number) as num FROM visitors.visitors GROUP BY home_state ORDER BY num DESC LIMIT 5', (err,results,fields)=>{
      if (err) throw err;
      let states = [];
      let number = [];
      for (let result of results){
        states.push(result.home_state);
        number.push(result.num);
      }
      createBarGraph(states,number);
  });
  let year = 2016;
  let months = ['January','February','March','April','May','June','July','August','September', 'October', 'November','December'];
  conn.query(`SELECT MONTH(date_visited) AS m, SUM(number) num FROM visitors.visitors WHERE TIMESTAMPDIFF(MONTH, date_visited, CURDATE()) <= 12 GROUP BY m ORDER BY m ASC`, (err,results,fields)=>{
      if (err) throw err;
      let monthsLabels = [];
      let number = [];
      for (let result of results){
        monthsLabels.push(months[result.m-1]);
        number.push(result.num);
      }
      createLineGraph(monthsLabels, number);
  });
}

function createBarGraph(graphLabels, graphData){
    let ctx = document.getElementById("firstChart");
    ctx.parentNode.flexBasis = "700px";
    // ctx.width = '100';
    // ctx.height = '100';
    let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: graphLabels,
        datasets: [{
              animation: {
                duration: 10000
            },
            label: 'Number of Visitors from top 5 states',
            data: graphData,
            backgroundColor: '#136988',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
  });
}

function createLineGraph(graphLabels, graphData){
    let ctx = document.getElementById("secondChart");
    ctx.parentNode.flexBasis = "700px";
    // ctx.width = '400';
    // ctx.height = '400';
    let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: graphLabels,
        datasets: [{
              animation: {
                duration: 10000
            },
            label: 'Number of Visitors for the last 12 months',
            data: graphData,
            backgroundColor: 'transparent',
            borderColor: '#136988',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
  });
}

/*-------------------------------------------------------------------------
          SETTINGS PAGE FUNCTIONS SECTION
  -------------------------------------------------------------------------*/
function loadInitialSettings(checkboxes){
  conn.query("SELECT * FROM map_settings", (err,rows,fields)=>{
    if(err) throw error;
    for(let i=0; i < rows.length; i++){
      if (rows[i].status != 'disabled'){
        checkboxes[i].checked = true;
        checkboxes[i].parentNode.childNodes[5].disabled = false;
        checkboxes[i].parentNode.childNodes[5].value = rows[i].value;
      }
    }
  });
}

function saveMapSettings(checkboxes){
  let values = [];
  for (let i = 0; i < checkboxes.length; ++i){
    if (checkboxes[i].checked){
      let value = checkboxes[i].parentNode.childNodes[5].value;
      if (value){
        conn.query(`UPDATE map_settings SET status="enabled", value=${value} WHERE id=${i+1}`,(err,rows,fields)=>{
          if (err) throw err;
        });
      }
    }
  }
}

function resetMapSettings(checkboxes){
  for(let i =0; i < checkboxes.length; i++){
    checkboxes[i].parentNode.childNodes[5].value='';
    checkboxes[i].checked = false;
    checkboxes[i].parentNode.childNodes[5].disabled = true;
    conn.query(`UPDATE map_settings SET status="disabled", value=-1 WHERE id=${i+1}`,(err,rows,fields)=>{
      if (err) throw err;
    });
  }
}


/*-------------------------------------------------------------------------
          CONSTANT CONTACT FUNCTIONS SECTION
  -------------------------------------------------------------------------*/
//function to load previous constant contact exports
function loadPreviousExports(contentPage){
  let queryString = "SELECT date_from, date_to, number FROM constantcontact ORDER BY date_to DESC";
  let constantTable = contentPage.querySelector("#constant-contact-table");
  let display = "<tbody>"
  conn.query(queryString, (err,results,fields)=>{
    if (err) throw err;
    for(let result of results){
      display += "<tr>";
      display += "<td>" + formatDate(new Date(result.date_from)) + " to "+ formatDate(new Date(result.date_to)) + "</td>";
      display += "<td>" + result.number + "</td>";
      display += "</tr>"
    }

    if (results.length == 0){
      display += "<tr> <td colspan='14' rowspan='3' style=' font-size: 20px;'>No Previous Exports</td></tr>";
    }
    display += "</tbody>";
    if (constantTable.childNodes.length >= 4) {
      constantTable.removeChild(constantTable.lastChild);
    }
     constantTable.innerHTML += display;
     displayPendingExport(contentPage, results);
  });
}

//function to query database to display pending email exports for constant contact
function displayPendingExport(contentPage, results){
  let dateFrom = "";
  let dateTo = formatDate(new Date());
  let info =  contentPage.querySelector("#constant-contact p");
  console.log((new Date()).toISOString().substring(0, 10));
  if (results.length == 0)
  {
    conn.query("SELECT date_visited FROM visitors", (err,rows,fields)=>{
      if (rows.length != 0){
         dateFrom = formatDate(new Date(rows[0].date_visited));
         if (dateFrom < dateTo){
           info.innerHTML = "Exports pending for date range: <b>" + dateFrom + " to " + dateTo+"</b>";
           contentPage.querySelector("#dateFrom-con").value = rows[0].date_visited.toISOString().substring(0, 10);;
           contentPage.querySelector("#dateTo-con").value = (new Date()).toISOString().substring(0, 10);
         }
         else {
           contentPage.querySelector("#dateFrom-con").value = '';
           contentPage.querySelector("#dateTo-con").value = '';
           info.innerHTML = "<b>No exports pending for now</b>";
         }
      }
    });
  }
 else  {
   dateFrom = formatDate(new Date(results[0].date_to));
   if (dateFrom < dateTo){
     contentPage.querySelector("#dateFrom-con").value = results[0].date_to.toISOString().substring(0, 10);
     contentPage.querySelector("#dateTo-con").value = (new Date()).toISOString().substring(0, 10);
     info.innerHTML = "Exports pending for date range: <b>" + dateFrom + " to " + dateTo + "</b>";
   }
   else{
     contentPage.querySelector("#dateFrom-con").value = '';
     contentPage.querySelector("#dateTo-con").value = '';
     info.innerHTML = "<b>No exports pending for now</b>";
   }
 }
}

//function to format given date in the format mm/dd/yyyy
function formatDate(date){
  let dd = date.getDate();
  let mm = date.getMonth()+1;
  let yyyy = date.getFullYear();
  return mm+"/"+dd+"/"+yyyy;
}

//function to export email list for constant contact
function exportEmailLists(contentPage, fileName, filePath){
      console.log("here");
      let dateFrom = contentPage.querySelector("#dateFrom-con").value;
      let dateTo = contentPage.querySelector("#dateTo-con").value;
      if (dateFrom && dateTo){
        conn.query(`SELECT email FROM visitors WHERE date_visited BETWEEN DATE_FORMAT("${dateFrom}", '%y-%m-%d') AND DATE_FORMAT("${dateTo}", '%y-%m-%d')`, (err,results, fields)=>{
          let emails = [["S.N.", "Emails"]];
          let count = 0;
          for (let r of results){
            if (r.email){
              count++;
              emails.push([count, r.email]);
            }
          }
          writeNowToExcel(fileName, filePath, emails);
          conn.query("INSERT INTO constantcontact(date_from, date_to, number) VALUES(?,?,?)", [dateFrom,dateTo,count], (err,results,fields)=>{
            if (err) throw err;
            loadPreviousExports(contentPage);
          });
        });
      }
}
// function listenCheckboxes(databasePage){
//   let table = databasePage.querySelector("#visitorTable");
//   let dataRows = table.querySelectorAll("tbody tr");
//   console.log(dataRows.length);
//   for (row of dataRows){
//     row.addEventListener("click", ()=>{
//      row.querySelector("input[type='checkbox']").checked;
//    });
//   }
// }

/*-------------------------------------------------------------------------
          DATABASE PAGE FUNCTIONS SECTION
  -------------------------------------------------------------------------*/
/*
  function to query database to get the metro area for provided city and state
*/
function getMetroArea(city,state){
  let query = `SELECT metro_area FROM visitors WHERE home_city = "${city}"`;
  if (state != 'All')
      query += `AND home_state="${state}"`;

  conn.query(query, (err,rows,fields)=>{
    if (err) throw err;
    console.log(rows[0].metro_area);
    return rows[0].metro_area;
  });
}

/*
  function to create query string for the input values entered in the form
*/
function createQueryString(form, callback){
  let city = form.querySelector("#city").value.replace(" ","");
  let cityOnly = form.querySelector("#cityOnly").checked;
  let state = form.querySelector("#state").value;

  let queryString = ``;

  if (city){
    if(cityOnly)
    {
      queryString += `and home_city = "${city}"`;
      queryString += buildRestQuery(form);
      callback(conn, queryString);
    }
    else{
      let query = `SELECT metro_area FROM metropolitan WHERE city = "${city}"`;
      if (state != 'All')
          query += `AND state="${state}"`;

      conn.query(query, (err,rows,fields)=>{
        if (err) throw err;
        if(rows[0] != " " && rows[0] != null){
          queryString += `and metro_area IN (`;
          for (let i = 0; i < rows.length; i++){
            let metro_area = rows[i].metro_area;
            queryString += `"${metro_area}"`;
            if(i < rows.length-1){
               queryString += `,`;
            }
          }
          queryString += `)`;
          console.log(queryString);
        } else {
          queryString += `and home_city = "${city}"`;
        }
        queryString += buildRestQuery(form);
        callback(conn, queryString);
      });
    }
  }
  else {
    queryString += buildRestQuery(form);
    callback(conn, queryString);
  }
}

function buildRestQuery(form){
  let state = form.querySelector("#state").value;
  let zip = form.querySelector("#zip").value;
  let country = form.querySelector("#country").value;
  let dateFrom = form.querySelector("#dateFrom").value;
  let dateTo = form.querySelector("#dateTo").value;
  let travelReason = form.querySelector("#travelReason").value;
  let advertisement = form.querySelector("#advertisement").value;
  let hotelStay = form.querySelector("#hotelStay").value;

  let restQuery = '';
  if(state != 'All'){
    restQuery += `and home_state = "${state}"`;
  }
  if(zip){
    restQuery += `and zip_code = "${zip}"`;
  }
  if(country){
    restQuery += `and country = "${country}"`;
  }
  if(dateFrom && dateTo){
    restQuery += `and date_visited between "${dateFrom}" and "${dateTo}"`;
  }
  if (travelReason != 'All'){
    restQuery += `and travel_reason = "${travelReason}"`;
  }
  if (advertisement != 'All'){
    restQuery += `and advertisement = "${advertisement}"`;
  }
  if (hotelStay != 'All'){
    restQuery += `and hotel_stay = "${hotelStay}"`;
  }
  return restQuery;
}


function showDialog(callback,contentPage){
  const remote = require('electron').remote;
  const dialog = remote.dialog;
  dialog.showSaveDialog({
     title: "Export as",
     filters: [{name: 'Excel(.xlsx)', extensions: ['xlsx']}],
     nameFieldLabel: "sample"
   }, function (file) {
    if (file === undefined) return;
    console.log("fileRead");
    let filePieces = file.split("\\");
    let fileName = filePieces[filePieces.length-1];
    let filePath = filePieces.splice(0,filePieces.length-1).join("\\");
    callback(contentPage, fileName, filePath);
  });
}
