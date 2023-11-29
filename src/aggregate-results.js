const {COLORS} = require('./colors')
const Table = require('cli-table3')

const getTestScore = (results) => {
  const score = results.tests.reduce((acc, {status}) => {
    if (status === 'pass') {
      return acc + 1
    }
    return acc
  }, 0)

  return (score / results.tests.length) * (getMaxScore(results) || 1)
}

const getAllMaxScores = (runnerResults) => {
  return runnerResults.reduce((acc, {results}) => {
    return acc + results.max_score
  }, 0)
}

const getMaxScore = (results) => {
  return results.max_score || 0
}

const getWeight = (maxScore, allMaxScores) => {
  if (maxScore === 0) {
    return (0).toFixed(2)
  }
  const weight = allMaxScores !== 0 ? (maxScore / allMaxScores) * 100 : 0
  return Math.round(weight).toFixed(2)
}

function AggregateResults(runnerResults) {
  const table = new Table({
    head: ['Test Runner Name', 'Test Score', 'Max Score', 'Weight'],
    colWidths: [20, 13, 13, 10],
  })

  const allMaxScores = getAllMaxScores(runnerResults)

  console.log(COLORS.magenta, 'Test Runner Summary', COLORS.reset)

  const totals = [
    {
      score: 0,
      maxScore: 0,
      weight: 0,
    },
  ]

  runnerResults.forEach(({runner, results}) => {
    const maxScore = getMaxScore(results)
    const weight = getWeight(maxScore, allMaxScores)
    const score = getTestScore(results)

    table.push([runner.trim(), score, maxScore, weight])
    totals.push({
      score,
      maxScore,
      weight,
    })
  })

  table.push([
    'Total: ',
    '----',
    '----',
    totals
      .reduce((acc, {score, weight, maxScore}) => {
        return acc + ((score || 0) / (maxScore || 1)) * weight
      }, 0)
      .toFixed(2) + '%',
  ])
  console.log(table.toString())
}

exports.AggregateResults = AggregateResults
