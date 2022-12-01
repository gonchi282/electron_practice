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

ipcMain.handle('sendDate', async (event, _startDate, _endDate) => {
    startDate = _startDate
    endDate = _endDate
    debugLog(`startDate=${startDate}`)
    debugLog(`endDate=${endDate}`)
    const response = await queryItem()
    exportTsv('csvdata.tsv', response)
    debugLog(response)
})

async function queryItem() {
    const accessInfo = notionClient.getAccessInfo()
    const client = notionClient.getClient(accessInfo)
    const filter = notionClient.getFilter()
    const response = await notionClient.queryItem(client, accessInfo.database_id, filter)
    return response
}

function exportTsv(filename, response) {
    const properties = notionClient.getProperties()
    const data_str = notionClient.convertStringObject(response.results, properties)
    const tsv_data = notionClient.convertWeeklyReportsFormat(data_str)
    notionClient.exportWeeklyReportsTsv(filename, tsv_data)
}

function debugLog(message) {
    console.log(`${TAG}${message}`)
}