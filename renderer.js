const TAG = 'renderer: '
const TABLE_ID = 'attendant_table'

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

async function getTsvData() {
    const tsvData = await window.datacomms.getTsvData()
    return tsvData
}

async function debugLog(message) {
    await window.datacomms.debugLog(TAG, message)
}

window.datacomms.onload((event) => {
    loadFilter()
})

async function makeTable() {
    const body = document.body
    const tsvData = await getTsvData()
    if (!tsvData) {
        return
    }

    let table = document.getElementById(TABLE_ID)
    if (table) {
        clearTable(table)
    } else {
        table = createTable()
        body.append(table)
    }

    //makeTableHeader(table)
    makeTableBody(table, tsvData)

    debugLog("makeTable")
}

function clearTable(table) {
    if (!table) {
        return
    }
    while (table.firstChild) {
        table.removeChild(table.firstChild)
    }
}

function createTable() {
    const table = document.createElement("table")
    table.setAttribute("border", 1)
    table.setAttribute("id", TABLE_ID)
    return table
}

function makeTableHeader(table) {
    const tr1 = document.createElement("tr")
    const th1 = document.createElement("th")
    const th2 = document.createElement("th")
    th1.innerText = "食べ物"
    th2.innerText = "乗り物"
    tr1.append(th1, th2)
    table.append(tr1)
}

function makeTableBody(table, tsvData) {
    const tsvLines = tsvData.split('\n')
    let oldDate = ""
    tsvLines.forEach((line) => {
        if (!line) {
            return
        }
        const datas = line.split('\t')
        const trNode = document.createElement('tr')
        datas.forEach((data) => {
            data = (data ?? "")
            if (data.match('\\d{1,4}-\\d{1,2}-\\d{1,2}')) {
                // 日付データは1行追加
                if (oldDate == data) {
                    // 前と同じ日付の場合は無視
                    return
                }
                const trNode2 = document.createElement('tr')
                const tdNode2 = document.createElement('td')
                tdNode2.innerHTML = data
                trNode2.append(tdNode2)
                table.append(trNode2)
                oldDate = data
                return
            }
            const tdNode = document.createElement('td')
            tdNode.innerHTML = data
            trNode.append(tdNode)
        })
        table.append(trNode)
    })
}