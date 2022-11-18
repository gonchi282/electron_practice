const TAG = 'renderer: '

console = require('electron').remote.require('console');

async function click_send() {
    const startDate = document.getElementById('start_date')
    const endDate = document.getElementById('end_date')

    debug_log(`start_date=${startDate.value}`)
    debug_log(`end_date=${endDate.value}`)

    await window.datacomms.sendDate(startDate.value, endDate.value)
}

function debug_log(message) {
    console.log(`${TAG}${message}`)
}