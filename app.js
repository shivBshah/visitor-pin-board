const electron = require('electron')
const {app, BrowserWindow} = electron
require('electron-reload')(__dirname);

app.on('ready', () => {
    let win = new BrowserWindow({show: false, kiosk:true})
    win.setMenu(null);
   win.maximize();
    win.loadURL(`file://${__dirname}/main-view.html`)
    win.show();
   win.webContents.openDevTools();
});
