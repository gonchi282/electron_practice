const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

const TAG = 'main : '

const preload_js = 'preload.js'
const index_html = 'index.html'

var startDate
var endDate

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, preload_js),
        },
    })
    debug_log(__dirname)
    mainWindow.loadFile(path.join(__dirname, index_html))
}

// app.whenReady.then(() => {
//     createWindow()

//     app.on('activate', () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow()
//         }
//     })
// })

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
    app.quit()
})

ipcMain.handle('ping', () => 'pong')

ipcMain.handle('sendDate', async (event, _startDate, _endDate) => {
    startDate = _startDate
    endDate = _endDate
    debug_log(`startDate=${startDate}`)
    debug_log(`endDate=${endDate}`)
})

function debug_log(message) {
    console.log(`${TAG}${message}`)
}