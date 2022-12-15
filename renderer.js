const TAG = 'renderer: '

console = require('electron').remote.require('console');

async function sendClicked() {
    const elemStartDate = document.getElementById('start_date')
    const elemEndDate = document.getElementById('end_date')

    debugLog(`start_date=${elemStartDate.value}`)
    debugLog(`end_date=${elemEndDate.value}`)

    await window.datacomms.sendDate(elemStartDate.value, elemEndDate.value)
}

async function debugLog(message) {
    await window.datacomms.debugLog(TAG, message)
}