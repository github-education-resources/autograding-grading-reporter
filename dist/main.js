var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/colors.js
var require_colors = __commonJS({
  "src/colors.js"(exports) {
    var COLORS = {
      reset: "\x1B[0m",
      cyan: "\x1B[36m",
      green: "\x1B[32m",
      red: "\x1B[31m",
      yellow: "\x1B[33m",
      magenta: "\x1B[35m"
    };
    exports.COLORS = COLORS;
  }
});

// src/console-results.js
var require_console_results = __commonJS({
  "src/console-results.js"(exports) {
    var { COLORS } = require_colors();
    exports.ConsoleResults = function ConsoleResults2(runnerResults) {
      let grandTotalPassedTests = 0;
      let grandTotalTests = 0;
      runnerResults.forEach(({ runner, results }, index) => {
        if (index > 0) {
          console.log(`${COLORS.magenta}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}\u{1F680}${COLORS.reset}
`);
        }
        console.log(`${COLORS.cyan}\u{1F504} Processing: ${runner}${COLORS.reset}`);
        let passedTests = 0;
        const totalTests = results.tests.length;
        results.tests.forEach((test) => {
          if (test.status === "pass") {
            console.log(`${COLORS.green}\u2705 ${test.name}
${COLORS.reset}`);
            passedTests += 1;
          } else {
            console.log(`${COLORS.red}\u274C ${test.name}
`);
            console.log(`Error: ${test.message || `Failed to run test '${test.name}'`}
${COLORS.reset}`);
          }
        });
        grandTotalPassedTests += passedTests;
        grandTotalTests += totalTests;
        const points = passedTests / totalTests * 100;
        console.log(`Total points for ${runner}: ${points.toFixed(2)}/100
`);
      });
      const grandTotalPoints = grandTotalPassedTests / grandTotalTests * 100;
      console.log(`${COLORS.cyan}\u{1F3C6} Grand Total Points: ${grandTotalPoints.toFixed(2)}/100${COLORS.reset}
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

// src/aggregate-results.js
var require_aggregate_results = __commonJS({
  "src/aggregate-results.js"(exports) {
    var { COLORS } = require_colors();
    var Table = require("cli-table3");
    var getTestScore = (results) => {
      const score = results.tests.reduce((acc, { status }) => {
        if (status === "pass") {
          return acc + 1;
        }
        return acc;
      }, 0);
      return score / results.tests.length * (getMaxScore(results) || 1);
    };
    var getAllMaxScores = (runnerResults) => {
      return runnerResults.reduce((acc, { results }) => {
        return acc + results.max_score;
      }, 0);
    };
    var getMaxScore = (results) => {
      return results.max_score || 0;
    };
    var getWeight = (maxScore, allMaxScores) => {
      if (maxScore === 0) {
        return 0 .toFixed(2);
      }
      const weight = allMaxScores !== 0 ? maxScore / allMaxScores * 100 : 0;
      return Math.round(weight).toFixed(2);
    };
    function AggregateResults2(runnerResults) {
      const table = new Table({
        head: ["Test Runner Name", "Test Score", "Max Score", "Weight"],
        colWidths: [20, 13, 13, 10]
      });
      const allMaxScores = getAllMaxScores(runnerResults);
      console.log(COLORS.magenta, "Test Runner Summary", COLORS.reset);
      let totals = [
        {
          score: 0,
          maxScore: 0,
          weight: 0
        }
      ];
      runnerResults.forEach(({ runner, results }) => {
        const maxScore = getMaxScore(results);
        const weight = getWeight(maxScore, allMaxScores);
        const score = getTestScore(results);
        table.push([runner.trim(), score, maxScore, weight]);
        totals.push({
          score,
          maxScore,
          weight
        });
      });
      table.push([
        "Total: ",
        "----",
        "----",
        totals.reduce((acc, { score, weight, maxScore }) => {
          return acc + (score || 0) / (maxScore || 1) * weight;
        }, 0).toFixed(2) + "%"
      ]);
      console.log(table.toString());
    }
    exports.AggregateResults = AggregateResults2;
  }
});

// src/main.js
var core = require("@actions/core");
var { ConsoleResults } = require_console_results();
var { NotifyClassroom } = require_notify_classroom();
var { AggregateResults } = require_aggregate_results();
try {
  const runnerResults = core.getInput("runners").split(",").map((runner) => {
    const encodedResults = process.env[`${runner.trim().toUpperCase()}_RESULTS`];
    const json = Buffer.from(encodedResults, "base64").toString("utf-8");
    return { runner, results: JSON.parse(json) };
  });
  ConsoleResults(runnerResults);
  NotifyClassroom(runnerResults);
  AggregateResults(runnerResults);
  if (runnerResults.some((r) => r.results.status === "fail")) {
    core.setFailed("Some tests failed.");
  }
} catch (error) {
  core.setFailed(error.message);
}
