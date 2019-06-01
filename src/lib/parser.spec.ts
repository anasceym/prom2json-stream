// tslint:disable:no-expression-statement
import test from 'ava'
import split from 'binary-split'
import { Readable } from 'stream'

import Prom2Json, { Metric } from './parser'

function testRunner(input: string): Promise<Metric[]> {
  const stream = new Readable()
  stream.push(input)
  stream.push(null)

  const collectedData: Metric[] = []

  return new Promise((resolve, reject) => {
    stream
      .pipe(split())
      // Action
      .pipe(Prom2Json())
      .on('data', (data: Metric) => {
        collectedData.push(data)
      })
      .on('end', () => resolve(collectedData))
      .on('error', (err: Error) => reject(err))
  })
}

test('parse normal', async t => {
  // Prepare
  const metricsBuff = `
# HELP cdastatsd_bgp_route_total The total bgp routes exposed from cdastatsd
# TYPE cdastatsd_bgp_route_total gauge
cdastatsd_bgp_route_total 3286
`
  // Action
  const result = await testRunner(metricsBuff)

  // Assert
  t.deepEqual(result, [
    {
      help: 'The total bgp routes exposed from cdastatsd',
      name: 'cdastatsd_bgp_route_total',
      type: 'gauge',
      value: 3286
    }
  ])
})

test('parse with label', async t => {
  // Prepare
  const metricsBuff = `
# HELP cdastatsd_disk_io_time_per_second The result of disk io time (rated)
# TYPE cdastatsd_disk_io_time_per_second gauge
cdastatsd_disk_io_time_per_second{name="ada0"} 371.59029479684915
`
  // Action
  const result: Metric[] = await testRunner(metricsBuff)

  // Assert
  t.deepEqual(result, [
    {
      help: 'The result of disk io time (rated)',
      labels: {
        name: 'ada0'
      },
      name: 'cdastatsd_disk_io_time_per_second',
      type: 'gauge',
      value: 371.59029479684915
    }
  ])
})

test('parse with multiple labels', async t => {
  // Prepare
  const metricsBuff = `
# HELP cdastatsd_disk_io_time_per_second The result of disk io time (rated)
# TYPE cdastatsd_disk_io_time_per_second gauge
cdastatsd_disk_io_time_per_second{name="ada0",name2="ada1"} 371.59029479684915
`
  // Action
  const result: Metric[] = await testRunner(metricsBuff)

  // Assert
  t.deepEqual(result, [
    {
      help: 'The result of disk io time (rated)',
      labels: {
        name: 'ada0',
        name2: 'ada1'
      },
      name: 'cdastatsd_disk_io_time_per_second',
      type: 'gauge',
      value: 371.59029479684915
    }
  ])
})

test('parse counter metric', async t => {
  // Prepare
  const metricsBuff = `
# HELP cdastatsd_bgp_route_total The total bgp routes exposed from cdastatsd
# TYPE cdastatsd_bgp_route_total counter
cdastatsd_bgp_route_total 1
`
  // Action
  const result = await testRunner(metricsBuff)

  // Assert
  t.deepEqual(result, [
    {
      help: 'The total bgp routes exposed from cdastatsd',
      name: 'cdastatsd_bgp_route_total',
      type: 'counter',
      value: 1
    }
  ])
})
