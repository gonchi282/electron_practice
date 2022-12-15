const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('datacomms', {
    sendDate: (startDate, endDate) => ipcRenderer.invoke('sendDate', startDate, endDate),
    loadFilter: () => ipcRenderer.invoke('loadFilter'),
    debugLog: (tag, message) => ipcRenderer.invoke('debugLog', tag, message),
})