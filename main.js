const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const notionClient = require('./notion_client.js')

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
    mainWindow.loadFile(path.join(__dirname, index_html))
    mainWindow.webContents.on('did-finish-load', () =>{
        mainWindow.webContents.send('onload')
    })
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
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.handle('sendDate', async (event, _startDate, _endDate) => {
    let ret = true
    const filter = makeFilter(_startDate, _endDate)
    const response = await queryItem(filter)
    exportTsv('csvdata.tsv', response)
    ret = saveFilter(filter)
    return ret
})

ipcMain.handle('loadFilter', async (event) => {
    const filter = loadFilter()
    return filter
})

ipcMain.handle('debugLog', async (event, _tag, _message) => {
    debugLog(_tag, _message)
})

async function queryItem(filter) {
    const accessInfo = notionClient.getAccessInfo()
    const client = notionClient.getClient(accessInfo)
    const response = await notionClient.queryItem(client, accessInfo.database_id, filter)
    return response
}

function exportTsv(filename, response) {
    const properties = notionClient.getProperties()
    const data_str = notionClient.convertStringObject(response.results, properties)
    const tsv_data = notionClient.convertWeeklyReportsFormat(data_str)
    notionClient.exportWeeklyReportsTsv(filename, tsv_data)
}

function makeFilter(startDate, endDate) {
    return notionClient.makeFilter(startDate, endDate)
}

function saveFilter(filter) {
    return notionClient.saveFilter(filter)
}

function loadFilter() {
    return notionClient.loadFilter()
}

function debugLog(...args) {
    switch (args.length) {
    case 1:
        debugLog1(args[0])
        break;
    case 2:
        debugLog2(args[0], args[1])
        break;
    default:
        break;
    }
}

function debugLog2(tag, message) {
    console.log(`${tag}${message}`)
}

function debugLog1(message) {
    console.log(`${TAG}${message}`)
}
