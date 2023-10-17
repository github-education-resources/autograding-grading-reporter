const core = require('@actions/core');

try {
    const runners = core.getInput('runners').split(',');
    let grandTotalPassedTests = 0;
    let grandTotalTests = 0;
    let failed = false;

    const colors = {
        reset: '\x1b[0m',
        cyan: '\x1b[36m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        magenta: '\x1b[35m'
    };

    runners.forEach((runner, index) => {
        // Fun transition to new runner
        if (index > 0) {
            console.log(`${colors.magenta}🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀${colors.reset}\n`);
        }

        const encodedResults = process.env[`${runner.toUpperCase()}_RESULTS`];
        const json = Buffer.from(encodedResults, 'base64').toString('utf-8');
        const results = JSON.parse(json);

        console.log(`${colors.cyan}🔄 Processing: ${runner}${colors.reset}`);
        let passedTests = 0;
        let totalTests = results.tests.length;

        results.tests.forEach(test => {
            console.log(`${colors.yellow}📝 ${test.name}\n${colors.reset}`);

            if (test.status === "pass") {
                console.log(`${colors.green}✅ ${test.name}\n${colors.reset}`);
                passedTests += 1;
            } else {
                failed = true;
                console.log(`${colors.red}❌ ${test.name}\n`);
                console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}\n${colors.reset}`);
            }
        });

        // Update grand totals
        grandTotalPassedTests += passedTests;
        grandTotalTests += totalTests;

        // Calculate and display points for the current runner
        let points = (passedTests / totalTests) * 100;
        console.log(`Total points for ${runner}: ${points.toFixed(2)}/100\n`);
    });

    // Calculate and display grand total points
    let grandTotalPoints = (grandTotalPassedTests / grandTotalTests) * 100;
    console.log(`${colors.cyan}🏆 Grand Total Points: ${grandTotalPoints.toFixed(2)}/100${colors.reset}\n`);

    if (failed) {
        core.setFailed("Some tests failed.");
    }
} catch (error) {
    core.setFailed(error.message);
}
