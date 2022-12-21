const TAG = 'renderer: '

async function sendClicked() {
    const elemStartDate = document.getElementById('start_date')
    const elemEndDate = document.getElementById('end_date')

    debugLog(`start_date=${elemStartDate.value}`)
    debugLog(`end_date=${elemEndDate.value}`)

    await window.datacomms.sendDate(elemStartDate.value, elemEndDate.value)
}

async function loadFilter() {
    const filter = await window.datacomms.loadFilter()
    const startDate = filter.and[0].date.on_or_after
    const endDate = filter.and[1].date.on_or_before

    debugLog(`startDate = ${startDate}`)
    debugLog(`endDate = ${endDate}`)

    const elementStartDate = document.getElementById('start_date')
    const elementEndDate = document.getElementById('end_date')

    elementStartDate.value = startDate
    elementEndDate.value = endDate
}

async function debugLog(message) {
    await window.datacomms.debugLog(TAG, message)
}

window.datacomms.onload((event) => {
    loadFilter()
})