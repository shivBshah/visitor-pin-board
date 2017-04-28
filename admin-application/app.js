const {app, BrowserWindow} = require('electron');
require('electron-reload')(__dirname);

app.on('ready', ()=>{
  let win = new BrowserWindow({show: false, height:800, width:1000, webPreferences: { nodeIntegration: true }});
  //win.maximize();
  win.loadURL(`file://${__dirname}/index.html`)
  win.show();
  //win.webContents.openDevTools();
});
