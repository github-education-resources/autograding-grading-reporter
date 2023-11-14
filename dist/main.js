var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/console-results.js
var require_console_results = __commonJS({
  "src/console-results.js"(exports) {
    exports.ConsoleResults = function ConsoleResults2(runnerResults) {
      let grandTotalPassedTests = 0;
      let grandTotalTests = 0;
      const colors = {
        reset: "\x1B[0m",
        cyan: "\x1B[36m",
        green: "\x1B[32m",
        red: "\x1B[31m",
        yellow: "\x1B[33m",
        magenta: "\x1B[35m"
      };
      runnerResults.forEach(({ runner, results }, index) => {
        if (index > 0) {
          console.log(`${colors.magenta}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}${colors.reset}
`);
        }
        console.log(`${colors.cyan}\u{1F504} Processing: ${runner}${colors.reset}`);
        let passedTests = 0;
        const totalTests = results.tests.length;
        results.tests.forEach((test) => {
          if (test.status === "pass") {
            console.log(`${colors.green}\u2705 ${test.name}
${colors.reset}`);
            passedTests += 1;
          } else {
            console.log(`${colors.red}\u274C ${test.name}
`);
            console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}
${colors.reset}`);
          }
        });
        grandTotalPassedTests += passedTests;
        grandTotalTests += totalTests;
        const points = passedTests / totalTests * 100;
        console.log(`Total points for ${runner}: ${points.toFixed(2)}/100
`);
      });
      const grandTotalPoints = grandTotalPassedTests / grandTotalTests * 100;
      console.log(`${colors.cyan}\u{1F3C6} Grand Total Points: ${grandTotalPoints.toFixed(2)}/100${colors.reset}
`);
    };
  }
});

// src/notify-classroom.js
var require_notify_classroom = __commonJS({
  "src/notify-classroom.js"(exports) {
    var core2 = require("@actions/core");
    var github = require("@actions/github");
    exports.NotifyClassroom = async function NotifyClassroom2(runnerResults) {
      const { totalScore, maxScore } = runnerResults.reduce((acc, { results }) => {
        if (!results.max_score)
          return acc;
        acc.maxScore += results.max_score;
        results.tests.forEach(({ score }) => {
          acc.totalScore += score;
        });
        return acc;
      }, { totalScore: 0, maxScore: 0 });
      if (!maxScore)
        return;
      const token = process.env.GITHUB_TOKEN || core2.getInput("token");
      if (!token || token === "")
        return;
      const octokit = github.getOctokit(token);
      if (!octokit)
        return;
      const nwo = process.env.GITHUB_REPOSITORY || "/";
      const [owner, repo] = nwo.split("/");
      if (!owner)
        return;
      if (!repo)
        return;
      const runId = parseInt(process.env.GITHUB_RUN_ID || "");
      if (Number.isNaN(runId))
        return;
      const checkRunsResponse = await octokit.rest.checks.listForRepo({
        owner,
        repo,
        check_name: "Autograding"
      });
      const checkRun = checkRunsResponse.data.check_runs.find((cr) => cr.name === "Autograding" && cr.check_suite.workflow_run_id === runId);
      if (!checkRun)
        return;
      const text = `Points ${totalScore}/${maxScore}`;
      await octokit.rest.checks.update({
        owner,
        repo,
        check_run_id: checkRun.id,
        output: {
          title: "Autograding",
          summary: text,
          text,
          annotations: [{
            // Using the `.github` path is what GitHub Actions does
            path: ".github",
            start_line: 1,
            end_line: 1,
            annotation_level: "notice",
            message: text,
            title: "Autograding complete"
          }]
        }
      });
    };
  }
});

// src/main.js
var core = require("@actions/core");
var { ConsoleResults } = require_console_results();
var { NotifyClassroom } = require_notify_classroom();
try {
  const runnerResults = core.getInput("runners").split(",").map((runner) => {
    const encodedResults = process.env[`${runner.toUpperCase()}_RESULTS`];
    const json = Buffer.from(encodedResults, "base64").toString("utf-8");
    return { runner, results: JSON.parse(json) };
  });
  ConsoleResults(runnerResults);
  NotifyClassroom(runnerResults);
  if (runnerResults.some((r) => r.results.status === "fail")) {
    core.setFailed("Some tests failed.");
  }
} catch (error) {
  core.setFailed(error.message);
}
