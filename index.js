const { app, BrowserWindow, ipcMain, shell } = require('electron'),
    ffmpeg = require('fluent-ffmpeg'),
    path = require('path');

require('electron-reload')(__dirname + "\\web");
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('web/index.html')
}

app.whenReady().then(createWindow)

ipcMain.on('export', (event, arg) => {
    var ff = ffmpeg(arg.path)
        .size(arg.x + "x" + arg.y);
        if(arg.fps) ff.fps(arg.fps);
        ff
        .setStartTime(arg.startTime)
        .setDuration(arg.endTime - arg.startTime)
        .output(__dirname + "\\" + path.basename(arg.path))
        .on('progress', function (progress) {
            win.webContents.send("exportProgress", progress.percent)
        })
        .on('end', function (err, stdout, stderr) {
            win.webContents.send("exportDone", "");
            shell.showItemInFolder(__dirname + "\\" + path.basename(arg.path));
        })
        .run();

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // Unter macOS ist es üblich, für Apps und ihre Menu Bar
    // aktiv zu bleiben, bis der Nutzer explizit mit Cmd + Q die App beendet.
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
    // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})