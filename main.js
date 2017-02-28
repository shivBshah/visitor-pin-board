const electron = require('electron')
const {app, BrowserWindow} = electron

app.on('ready', () => {
    let win = new BrowserWindow({show: false})
    win.setMenu(null);
    win.maximize();
    win.loadURL(`file://${__dirname}/Report.html`)
    win.show();
    win.webContents.openDevTools();
})
