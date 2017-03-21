const electron = require('electron')
const {app, BrowserWindow} = electron

require('electron-reload')(__dirname);

app.on('ready', () => {
    let win = new BrowserWindow({show: false})
    win.setMenu(null);
    win.maximize();
    win.loadURL(`file://${__dirname}/src/main.html`)

    win.on('ready-to-show', function() {
          win.show();
          win.focus();
      });
    win.webContents.openDevTools();
})
