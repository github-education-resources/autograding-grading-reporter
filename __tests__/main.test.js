const process = require('process')
const cp = require('child_process')
const path = require('path')

const node = process.execPath
const ip = path.join(__dirname, '..','dist', 'main.js')
const options = {
  env: process.env,
  encoding: 'utf-8'
}

test('test runs', () => {
  process.env.RESULT1_RESULTS = Buffer.from('{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }').toString('base64')
  process.env.INPUT_RUNNERS = 'result1'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toBe('pass')
})

test('outputs error if test-name not provided', () => {
  process.env['INPUT_TEST-NAME'] = ''

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = atob(encodedResult)

  expect(result).toContain('Input required and not supplied: test-name')
})

test('outputs error if command is not provided', () => {
  process.env['INPUT_TEST-NAME'] = 'Test 1'
  process.env.INPUT_COMMAND = ''

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = atob(encodedResult)

  expect(result).toContain('Input required and not supplied: command')
})

test('outputs error if expected-output is not provided', () => {
  process.env['INPUT_TEST-NAME'] = 'Test 1'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env['INPUT_EXPECTED-OUTPUT'] = ''

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = atob(encodedResult)

  expect(result).toContain('Input required and not supplied: expected-output')
})

test('outputs error if comparison-method is not provided', () => {
  process.env['INPUT_TEST-NAME'] = 'Test 1'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello, World!'
  process.env['INPUT_COMPARISON-METHOD'] = ''

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = atob(encodedResult)

  expect(result).toContain('Input required and not supplied: comparison-method')
})

test('throws error for invalid comparison method', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Invalid Comparison'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env.INPUT_INPUT = 'Hello, World!'
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello, World!'
  process.env['INPUT_COMPARISON-METHOD'] = 'invalid_method'
  process.env.INPUT_TIMEOUT = '10'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = atob(encodedResult)

  expect(result).toContain('Invalid comparison method: invalid_method')
})

test('handles command timeout correctly', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Timeout'
  process.env.INPUT_COMMAND = 'sleep 3' // This should timeout
  process.env.INPUT_INPUT = ''
  process.env['INPUT_EXPECTED-OUTPUT'] = 'beef'
  process.env['INPUT_COMPARISON-METHOD'] = 'exact'
  process.env.INPUT_TIMEOUT = '0.01' // ~1 second timeout

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = JSON.parse(atob(encodedResult))

  expect(result.tests[0].status).toBe('fail')
  expect(result.tests[0].message).toContain('Command was killed due to timeout')
})

test('runs comparison method: exact', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Exact'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env.INPUT_INPUT = ''
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello, World!'
  process.env['INPUT_COMPARISON-METHOD'] = 'exact'
  process.env.INPUT_TIMEOUT = '10'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = JSON.parse(atob(encodedResult))

  expect(result.tests[0].status).toBe('pass')
  expect(result.tests[0].message).toBe(null)
})

test('runs comparison method: contains', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Contains'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env.INPUT_INPUT = ''
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello'
  process.env['INPUT_COMPARISON-METHOD'] = 'contains'
  process.env.INPUT_TIMEOUT = '10'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = JSON.parse(atob(encodedResult))

  expect(result.tests[0].status).toBe('pass')
  expect(result.tests[0].message).toBe(null)
})

test('runs comparison method: regex', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Regex'
  process.env.INPUT_COMMAND = 'echo Hello, World!'
  process.env.INPUT_INPUT = ''
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello,\\sWorld!'
  process.env['INPUT_COMPARISON-METHOD'] = 'regex'
  process.env.INPUT_TIMEOUT = '10'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = JSON.parse(atob(encodedResult))

  expect(result.tests[0].status).toBe('pass')
  expect(result.tests[0].message).toBe(null)
})

test('passes input through standard input', () => {
  process.env['INPUT_TEST-NAME'] = 'Test Input'
  process.env.INPUT_COMMAND = 'cat'
  process.env.INPUT_INPUT = 'Hello, World!'
  process.env['INPUT_EXPECTED-OUTPUT'] = 'Hello, World!'
  process.env['INPUT_COMPARISON-METHOD'] = 'exact'
  process.env.INPUT_TIMEOUT = '10'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()

  const encodedResult = stdout.split('::set-output name=result::')[1].trim()
  const result = JSON.parse(atob(encodedResult))

  expect(result.tests[0].status).toBe('pass')
  expect(result.tests[0].message).toBe(null)
})
