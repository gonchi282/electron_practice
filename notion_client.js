const {Client} = require('@notionhq/client')
const fs = require('fs')
const iconv = require('iconv-lite')

const ACCESSINFO_FILE = 'accessinfo.json'
const PROPERTIES_FILE = 'properties.json'
const FILTER_FILE = 'filter.json'

exports.getClient = function(accessInfo) {
    return new Client({auth : accessInfo.apikey})
}

exports.getAccessInfo = () => {
    const accessInfoJson = fs.readFileSync(ACCESSINFO_FILE, 'utf-8')
    const accessInfo = JSON.parse(accessInfoJson)
    return accessInfo
}

exports.getProperties = function() {
    const propertiesJson = fs.readFileSync(PROPERTIES_FILE, 'utf-8')
    const properties = JSON.parse(propertiesJson)
    return properties
}

exports.getFilter = function() {
    const filterJson = fs.readFileSync(FILTER_FILE, 'utf-8')
    const filter = JSON.parse(filterJson)
    return filter
}

exports.queryItem = async function(client, databaseId, filter) {
    console.log(databaseId)
    console.log(filter)
    try {
        const response = await client.databases.query({
            database_id: databaseId,
            filter: filter,
            sorts : [
                {
                    property : "日付",
                    direction: "ascending"
                },
                {
                    property : "名前",
                    direction: "ascending"
                }
            ]
        })
        return response
    } catch (error) {
        console.error(error.body)
    }

    return null
}

exports.convertStringObject = function(results, properties) {
    let datas = []
    results.forEach(result => {
        let data = {}
        properties.forEach(property => {
            let dataobj = result.properties[property.name]
            dataobj[property.name] = ''
            switch (property.type) {
                case 'text':
                    if (dataobj.title[0]) {
                        data[property.name] = dataobj.title[0].plain_text;
                    }
                    break;
                case 'date':
                    if (dataobj.date) {
                        data[property.name] = dataobj.date.start
                    }
                    break;
                case 'rich_text':
                    if (dataobj.rich_text[0]) {
                        data[property.name] = dataobj.rich_text[0].plain_text
                    }
                    break;
                case 'number':
                    if (dataobj.number) {
                        data[property.name] = dataobj.number//.toString(10)
                    }
                    break;
                case 'select':
                    if (dataobj.select) {
                        data[property.name] = dataobj.select.name
                    }
                    break;
                default:
                    break;
            }
        })
        datas.push(data)
    })

    return datas
}

exports.convertWeeklyReportsFormat = function(datas) {
    let lines = ""
    datas.forEach(data => {
        let line = ""
        line += (data["日付"] ?? "") + "\t"
        line += (data["カテゴリ"] ?? "") + "\t"
        line += (data["詳細"] ?? "") + "\t"
        line += (data["種別"] ?? "") + "\t"
        for (let loop = 0; loop < 2; loop++) {
            for (let loop = 0; loop < 3; loop++) {
                line += (data["工数"] ?? 0).toString() + "\t"
            }
            line += "時間\t"
            if (loop < 1) {
                line += toTimeFormat(data["工数"] ?? 0) + "\t"
            } else {
                line += toTimeFormat(data["工数"] ?? 0)
            }
        }
        lines += line + "\n"
    })

    return lines
}

exports.exportWeeklyReportsTsv = function(filename, tsv_data) {
    fs.writeFileSync(filename, "")
    let fd = fs.openSync(filename, "w")
    let buf = iconv.encode(tsv_data, "Shift_JIS")
    fs.write(fd, buf, 0, buf.length, (err, written, buffer) => {})
}

exports.makeFilter = function(startDate, endDate) {
    return {
        "and" : [
            {
                "property": "日付",
                "date": {
                    "on_or_after": startDate
                }
            },
            {
                "property": "日付",
                "date": {
                    "on_or_before": endDate
                }
            }
        ]
    }
}

exports.saveFilter = function(filter) {
    if (!filter) {
        return false
    }
    fs.writeFileSync(FILTER_FILE, JSON.stringify(filter, null, 4))
    return true
}

exports.loadFilter = function() {
    const filterJson = fs.readFileSync(FILTER_FILE)
    const filter = JSON.parse(filterJson);
    return filter
}

function toTimeFormat(time) {
    let integer = Math.floor(time)
    let decimal = time - integer
    let decimalTime = Math.floor(decimal * 60)
    let timeStr = ""
    if (decimalTime >= 10) {
        timeStr = `${integer}:${decimalTime}`
    } else {
        timeStr = `${integer}:0${decimalTime}`
    }
    return timeStr
}