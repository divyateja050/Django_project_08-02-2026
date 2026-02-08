const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'ChemicalViz | Advanced Analytics',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        // Use the same icon as web app (chemical flask)
        icon: path.join(__dirname, 'icon.svg')
    });

    // Point to React dev server (for development)
    // Change to production build URL when packaging
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';

    mainWindow.loadURL(startUrl);

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
