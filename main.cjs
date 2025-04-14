const electron = require('electron');
const path = require('path');
const startServer = require('./server/server.js');

const { app, BrowserWindow } = electron;

let win; 
function createWindow() {
  console.log("creating window");
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, './tournament-ui/dist', 'index.html'));
}

console.log(app);
app.whenReady().then(() => {
  startServer();         
  createWindow();        
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});