const {COLORS} = require('./colors')
const Table = require('cli-table3')
const {
  getTotalMaxScore,
  getTestWeight,
  getTestScore,
  totalPercentageReducer,
  getMaxScoreForTest,
} = require('./helpers/test-helpers')

function getTableTotals(runnerResults, pushToTable) {
  const totalMaxScore = getTotalMaxScore(runnerResults)

  return runnerResults.map(({runner, results}) => {
    const maxScore = getMaxScoreForTest(results)
    const weight = getTestWeight(maxScore, totalMaxScore)
    const score = getTestScore(results)
    const testName = runner.trim()

    pushToTable([testName, score, maxScore, weight])

    return {
      score,
      maxScore,
      weight,
    }
  })
}

function AggregateResults(runnerResults) {
  try {
    const table = new Table({
      head: ['Test Runner Name', 'Test Score', 'Max Score', 'Weight'],
      colWidths: [20, 13, 13, 10],
    })

    console.log(COLORS.magenta, 'Test runner summary', COLORS.reset)

    const totals = getTableTotals(runnerResults, (row) => table.push(row))

    const totalPercent = totals.reduce(totalPercentageReducer, 0).toFixed(2) + '%'

    table.push(['Total: ', '----', '----', totalPercent])

    console.log(table.toString())
  } catch (error) {
    throw new Error(error.message)
  }
}

exports.AggregateResults = AggregateResults
exports.getTableTotals = getTableTotals
