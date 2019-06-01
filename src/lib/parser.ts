import through2 from 'through2'

export interface Metric {
  name?: string
  help?: string
  type?: string
  typeChecked?: boolean
  value: number
  labels?: { [index: string]: string }
}

export default function Prom2Json() {
  const metric: Metric = {
    typeChecked: false,
    value: 0
  }

  // tslint:disable-next-line: variable-name
  return through2.obj(function(chunk, _encoding, callback) {
    const line = chunk.toString()
    const helpLine = line.match(/^# HELP ([^\s]+) (.*)$/)

    if (helpLine && helpLine.length > 0) {
      metric.name = helpLine[1]
      metric.help = helpLine[2]

      return callback()
    }

    const typeLine = line.match(/^# TYPE ([^\s]+) (.*)$/)

    if (typeLine && typeLine.length > 0) {
      metric.type = typeLine[2]
      metric.typeChecked = true

      return callback()
    }

    if (!metric.typeChecked) {
      return callback()
    }

    const entry = line.match(
      new RegExp('^(' + metric.name + ')+({[^s]*})? (.*)$')
    )

    if (entry && entry.length) {
      const finalMetric: Metric = {
        help: metric.help,
        name: metric.name,
        type: metric.type,
        value: metric.value
      }

      finalMetric.value = parseFloat(entry[3])

      if (entry[2]) {
        const labels = entry[2].replace(/([^{}=,]+)[,]?=/g, '"$1":')
        finalMetric.labels = JSON.parse(labels)
      }

      this.push(finalMetric)
    }

    callback()
  })
}
