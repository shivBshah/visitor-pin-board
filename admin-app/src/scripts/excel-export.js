const excelbuilder = require('msexcel-builder');
const fs = require('fs');
const remote = require('electron').remote;

const dialog = remote.dialog;

//function to export all visitors' data from the HTML table into a Microsoft Excel file
function exportToExcel()
{
  //get date for file naming scheme.
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  }

  if(mm<10) {
      mm='0'+mm
  }
  today = mm+'_'+dd+'_'+yyyy;
  //end of date code

  //dialog box to select location
  dialog.showSaveDialog({
     title: "Export as",
     filters: [{name: 'Excel(.xlsx)', extensions: ['xlsx']}],
     nameFieldLabel: "sample"
   }, function (file) {
    if (file === undefined) return alert("You did not save the file.");
    let filePieces = file.split("\\");
    let fileName = filePieces[filePieces.length-1];
    let filePath = filePieces.splice(0,filePieces.length-1).join("\\");

    writeToExcel(filePath,fileName);
  });
}

function writeToExcel(filePath, fileName){
  //code for exporting data from HTML Table into an Excel file
  var tab = document.getElementById('visitorTable');
  var i=0; //current row
  var j=0; //current column
  var rowLength= tab.rows.length; //number of rows in HTML table
  var columnLength = tab.rows[0].cells.length; //number of columns per row in HTML table
  var workbook = excelbuilder.createWorkbook(filePath, fileName) //create new Excel workbook

  var sheet = workbook.createSheet('Visitors', columnLength, rowLength); //create spreadsheet in workbook

  //loop through HTML table and populate Excel cells with the data
  for(i = 0 ; i < rowLength; i++)
  {
    for(j = 0; j < columnLength; j++)
    {
      sheet.set(j+1, i+1, tab.rows[i].cells[j].innerHTML);
    }
  }

  //format header
  for (j = 0; j < columnLength; j++)
  {
      sheet.font(j+1, 1, {sz:'12', bold:'true'});
  }

  //set column width
  sheet.width(1, 11);
  sheet.width(2, 11);
  sheet.width(3, 25);
  sheet.width(4, 11);
  sheet.width(5, 12);
  sheet.width(6, 9);
  sheet.width(7, 16);
  sheet.width(8, 17);
  sheet.width(9, 14);
  sheet.width(10,10);
  sheet.width(11, 18);
  sheet.width(12, 7);
  sheet.width(13, 13);

  //save the Excel file
  workbook.save(function(ok){
    //alert("Export complete")
    dialog.showMessageBox({ message: "The file has been saved! :-)",
    buttons: ["OK"] });
  });

}
