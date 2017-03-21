const electron = require('electron')
const {app, BrowserWindow} = electron

app.on('ready', () => {
    let win = new BrowserWindow({show: false, kiosk:true})
    win.setMenu(null);
   win.maximize();
    win.loadURL(`file://${__dirname}/mainview.html`)
    win.show();
    win.webContents.openDevTools();
})
