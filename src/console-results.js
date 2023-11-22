const { COLORS } = require("./colors");

exports.ConsoleResults = function ConsoleResults(runnerResults) {
  let grandTotalPassedTests = 0;
  let grandTotalTests = 0;

  runnerResults.forEach(({ runner, results }, index) => {
    // Fun transition to new runner
    if (index > 0) {
      console.log(`${COLORS.magenta}🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀${COLORS.reset}\n`);
    }

    console.log(`${COLORS.cyan}🔄 Processing: ${runner}${COLORS.reset}`);
    let passedTests = 0;
    const totalTests = results.tests.length;

    results.tests.forEach((test) => {
      if (test.status === "pass") {
        console.log(`${COLORS.green}✅ ${test.name}\n${COLORS.reset}`);
        passedTests += 1;
      } else {
        console.log(`${COLORS.red}❌ ${test.name}\n`);
        console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}\n${COLORS.reset}`);
      }
    });

    // Update grand totals
    grandTotalPassedTests += passedTests;
    grandTotalTests += totalTests;

    // Calculate and display points for the current runner
    const points = (passedTests / totalTests) * 100;
    console.log(`Total points for ${runner}: ${points.toFixed(2)}/100\n`);
  });

  // Calculate and display grand total points
  const grandTotalPoints = (grandTotalPassedTests / grandTotalTests) * 100;
  console.log(`${COLORS.cyan}🏆 Grand Total Points: ${grandTotalPoints.toFixed(2)}/100${COLORS.reset}\n`);
};
