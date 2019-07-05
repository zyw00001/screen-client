const {app, BrowserWindow, Menu} = require('electron');

const DEV = true;
let win;

const addItemsForDev = (submenu) => {
  if (DEV) {
    const click = (item, win) => {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools();
      }
    };
    submenu.push({label: '打开控制台', accelerator: 'F12', visible: false, click});
  }
};

const setMenu = () => {
  const submenu = [
    {label: '重新加载', accelerator: 'F5', click: (item, win) => win.reload()}
  ];

  const template = [
    {label: '功能', submenu}
  ];

  addItemsForDev(submenu);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const createWindow = () => {
  win = new BrowserWindow({width: 250, height: 100});
  win.loadFile('index.html');
  win.on('closed', () => {
    win = null
  })
};

app.on('ready', () => {
  setMenu();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});