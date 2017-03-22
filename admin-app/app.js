const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const rq = require('electron-require');

const db = rq.remote('./src/scripts/dbconnection');

require('electron-reload')(__dirname);

let win = null;
app.on('ready', () => {
    win = new BrowserWindow({show: false});
    win.setMenu(null);
    win.maximize();
    win.loadURL(`file://${__dirname}/src/main.html`)

    win.on('ready-to-show', function() {
          win.show();
          win.focus();
      });
    win.webContents.openDevTools();

});

ipcMain.on('print', (event,arg)=>{
    win.webContents.print({silent:false, printBackground:true});
    event.returnValue = 'saved'; //synchronous reply
});
