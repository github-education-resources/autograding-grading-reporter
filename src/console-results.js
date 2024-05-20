const {COLORS} = require('./colors')
const {AggregateResults} = require('./aggregate-results')
const {getTestScore, getMaxScoreForTest} = require('./helpers/test-helpers')

exports.ConsoleResults = function ConsoleResults(runnerResults) {
  try {
    let runnerGrades = {};
    let grandTotalPassedTests = 0
    let grandTotalTests = 0

    runnerResults.forEach(({runner, results}, index) => {
      // Fun transition to new runner
      const maxScore = getMaxScoreForTest(results)

      // const weight = getTestWeight(maxScore, totalMaxScore);
      const score = getTestScore(results)

      // Create initial array for runner results
      runnerGrades[runner] = {
        "max": 0,
        "actual": 0,
      }

      if (index > 0) {
        console.log(`${COLORS.magenta}🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀${COLORS.reset}\n`)
      }

      console.log(`🔄 Processing: ${runner}`)
      let passedTests = 0
      const totalTests = results.tests.length

      results.tests.forEach((test) => {
        if (test.status === 'pass') {
          passedTests += 1
          if (test.line_no !== 0) {
            console.log(`${COLORS.green}✅ ${test.name} - line ${test.line_no}${COLORS.reset}`)
          } else {
            console.log(`${COLORS.green}✅ ${test.name}${COLORS.reset}`)
          }
        } else if (test.status === 'error') {
          console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}\n${COLORS.reset}`)
        } else {
          if (test.line_no !== 0) {
            console.log(`${COLORS.red}❌ ${test.name} - line ${test.line_no}${COLORS.reset}`)
          } else {
            console.log(`${COLORS.red}❌ ${test.name}${COLORS.reset}`)
          }
        }
        if (test.test_code) {
          console.log(`Test code:\n${test.test_code}\n`)
        }
      })

      // Update grand totals
      grandTotalPassedTests += passedTests
      grandTotalTests += totalTests

      // Calculate and display points for the current runner
      if (maxScore !== 0) {
        // Populate runner grades
        runnerGrades[runner]["max"] = maxScore
        runnerGrades[runner]["actual"] = score.toFixed(2)

        // Display total points for run
        console.log(`Total points for ${runner}: ${score.toFixed(2)}/${maxScore}\n`);
      }
    })

    console.log(`${COLORS.magenta}Test runner summary${COLORS.magenta}`)

    // Calculate and display grand total points
    AggregateResults(runnerResults)
    console.log(
      `${COLORS.cyan}🏆 Grand total tests passed: ${grandTotalPassedTests}/${grandTotalTests}${COLORS.reset}\n`,
    )

    // Return JSON array of runner grades
    return JSON.stringify(runnerGrades)
  } catch (error) {
    throw new Error(error.message)
  }
}
