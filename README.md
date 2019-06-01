# prom2json-stream  [![Build Status][travis-badge]][travis-url] [![codecov][codecov-badge]][codecov-url]

`prom2json-stream` is a NodeJS stream transformer to parse Prometheus exporters' metrics into JSON

#### Example

```
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 2.787184e+06
# HELP promhttp_metric_handler_requests_total Total number of scrapes by HTTP status code.
# TYPE promhttp_metric_handler_requests_total counter
promhttp_metric_handler_requests_total{code="200"} 139170
promhttp_metric_handler_requests_total{code="500"} 0
promhttp_metric_handler_requests_total{code="503"} 0
```
transformed into

```json
[  
  {  
    "help":"Number of bytes allocated and still in use.",
    "name":"go_memstats_alloc_bytes",
    "type":"gauge",
    "value":2787184
  },
  {  
    "help":"Total number of scrapes by HTTP status code.",
    "name":"promhttp_metric_handler_requests_total",
    "type":"counter",
    "value":139170,
    "labels":{  
      "code":"200"
    }
  },
  {  
    "help":"Total number of scrapes by HTTP status code.",
    "name":"promhttp_metric_handler_requests_total",
    "type":"counter",
    "value":0,
    "labels":{  
      "code":"500"
    }
  },
  {  
    "help":"Total number of scrapes by HTTP status code.",
    "name":"promhttp_metric_handler_requests_total",
    "type":"counter",
    "value":0,
    "labels":{  
      "code":"503"
    }
  }
]
```

## Installation

Using NPM
```bash
npm install prom2json-stream
```

## Usage

From a readable stream

```javascript
var Prom2Json = require('prom2json-stream')
var split = require('binary-split')

var buffer = `
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 2.787184e+06
`
var stream = new Readable()
stream.push(buffer)
stream.push(null)

stream
  .pipe(split())
  .pipe(Prom2Json())
  .on('data', function (data) {
    console.log(data)
  })
// {
//    "help": "Number of bytes allocated and still in use.",
//    "name": "go_memstats_alloc_bytes",
//    "type": "gauge",
//    "value": 2787184
//  }
```

## Caveats

This library only accepting string/buffer that has been splitted by newline. Please consider using any working splitter (eg: [binary-split](https://github.com/maxogden/binary-split)


[travis-badge]:https://travis-ci.org/anasceym/prom2json-stream.svg?branch=master
[travis-url]:https://travis-ci.org/anasceym/prom2json-stream
[codecov-badge]:https://codecov.io/gh/anasceym/prom2json-stream/branch/master/graph/badge.svg
[codecov-url]:https://codecov.io/gh/anasceym/prom2json-stream
