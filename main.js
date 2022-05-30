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

ipcMain.on("toMain", (event, args) => {
  fs.readFile("./export.json", (error, data) => {
    // Do something with file contents

    // Send result back to renderer process
    win.webContents.send("fromMain", responseObj);
  });
