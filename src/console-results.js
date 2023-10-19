exports.ConsoleResults = function ConsoleResults (runnerResults) {
  let grandTotalPassedTests = 0
  let grandTotalTests = 0

  const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m'
  }

  runnerResults.forEach(({ runner, results }, index) => {
    // Fun transition to new runner
    if (index > 0) {
      console.log(`${colors.magenta}🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀${colors.reset}\n`)
    }

    console.log(`${colors.cyan}🔄 Processing: ${runner}${colors.reset}`)
    let passedTests = 0
    const totalTests = results.tests.length

    results.tests.forEach(test => {
      if (test.status === 'pass') {
        console.log(`${colors.green}✅ ${test.name}\n${colors.reset}`)
        passedTests += 1
      } else {
        console.log(`${colors.red}❌ ${test.name}\n`)
        console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}\n${colors.reset}`)
      }
    })

    // Update grand totals
    grandTotalPassedTests += passedTests
    grandTotalTests += totalTests

    // Calculate and display points for the current runner
    const points = (passedTests / totalTests) * 100
    console.log(`Total points for ${runner}: ${points.toFixed(2)}/100\n`)
  })

  // Calculate and display grand total points
  const grandTotalPoints = (grandTotalPassedTests / grandTotalTests) * 100
  console.log(`${colors.cyan}🏆 Grand Total Points: ${grandTotalPoints.toFixed(2)}/100${colors.reset}\n`)
}
