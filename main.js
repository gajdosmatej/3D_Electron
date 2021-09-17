const { app, BrowserWindow } = require('electron');  //moduly pro Electron

function createWindow () {
  const win = new BrowserWindow({show: false});
  win.maximize();
  win.show();
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow()
})
