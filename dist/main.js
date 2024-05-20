/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 619:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const { COLORS } = __nccwpck_require__(751);
const Table = __nccwpck_require__(250);
const { getTotalMaxScore, getTestWeight, getTestScore, totalPercentageReducer, getMaxScoreForTest } = __nccwpck_require__(292);

function getTableTotals(runnerResults, pushToTable) {
  const totalMaxScore = getTotalMaxScore(runnerResults);

  return runnerResults.map(({ runner, results }) => {
    const maxScore = getMaxScoreForTest(results);
    // const weight = getTestWeight(maxScore, totalMaxScore);
    const score = getTestScore(results);
    const testName = runner.trim();

    pushToTable([testName, score, maxScore]);

    return {
      score,
      maxScore,
    };
  });
}

function AggregateResults(runnerResults) {
  try {
    const table = new Table({
      head: ["Test Runner Name", "Test Score", "Max Score"],
      colWidths: [20, 13, 13],
    });

    const totals = getTableTotals(runnerResults, (row) => table.push(row));

    // const totalPercent = totals.reduce(totalPercentageReducer, 0).toFixed(2) + "%";
    const totalTestScores = totals.reduce((acc, curr) => acc + curr.score, 0)
    const totalMaxScores = totals.reduce((acc, curr) => acc + curr.maxScore, 0)

    table.push(["Total: ", `${totalTestScores}`, `${totalMaxScores}`]);
    
    console.log(table.toString());
  } catch (error) {
    throw new Error(error.message);
  }
}

exports.AggregateResults = AggregateResults;
exports.getTableTotals = getTableTotals;


/***/ }),

/***/ 751:
/***/ ((__unused_webpack_module, exports) => {

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
};

exports.COLORS = COLORS;


/***/ }),

/***/ 27:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const {COLORS} = __nccwpck_require__(751)
const {AggregateResults} = __nccwpck_require__(619)
const {getTestScore, getMaxScoreForTest} = __nccwpck_require__(292)

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


/***/ }),

/***/ 292:
/***/ ((__unused_webpack_module, exports) => {

const getMaxScoreForTest = (runnerResult) => runnerResult.max_score || 0;

const getTotalMaxScore = (runnerResults) => {
  return runnerResults.reduce((acc, { results }) => acc + results.max_score, 0);
};

const totalPercentageReducer = (acc, { score, weight, maxScore }) => {
  return acc + ((score || 0) / (maxScore || 1)) * weight;
};

const getTestScore = (runnerResult) => {
  const { tests } = runnerResult;
  const score = runnerResult.tests.reduce((acc, { status }) => {
    return status === "pass" ? acc + 1 : acc;
  }, 0);

  return (score / tests.length) * (getMaxScoreForTest(runnerResult) || 0);
};

const getTestWeight = (maxScore, allMaxScores) => {
  if (maxScore === 0) {
    return (0).toFixed(1);
  }
  const weight = allMaxScores !== 0 ? (maxScore / allMaxScores) * 100 : 0;

  return Math.round(weight).toFixed(2);
};

exports.getMaxScoreForTest = getMaxScoreForTest;
exports.getTotalMaxScore = getTotalMaxScore;
exports.totalPercentageReducer = totalPercentageReducer;
exports.getTestScore = getTestScore;
exports.getTestWeight = getTestWeight;


/***/ }),

/***/ 916:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const core = __nccwpck_require__(927);
const github = __nccwpck_require__(273);

exports.NotifyClassroom = async function NotifyClassroom(runnerResults) {
  // combine max score and total score from each {runner, results} pair
  // if max_score is greater than 0 run the rest of this code
  const { totalPoints, maxPoints } = runnerResults.reduce(
    (acc, { results }) => {
      if (!results.max_score) return acc;

      acc.maxPoints += results.max_score;
      results.tests.forEach(({ score }) => {
        acc.totalPoints += score;
      });

      return acc;
    },
    { totalPoints: 0, maxPoints: 0 }
  );
  if (!maxPoints) return;

  // Our action will need to API access the repository so we require a token
  // This will need to be set in the calling workflow, otherwise we'll exit
  const token = process.env.GITHUB_TOKEN || core.getInput("token");
  if (!token || token === "") return;

  // Create the octokit client
  const octokit = github.getOctokit(token);
  if (!octokit) return;

  // The environment contains a variable for current repository. The repository
  // will be formatted as a name with owner (`nwo`); e.g., jeffrafter/example
  // We'll split this into two separate variables for later use
  const nwo = process.env.GITHUB_REPOSITORY || "/";
  const [owner, repo] = nwo.split("/");
  if (!owner) return;
  if (!repo) return;

  // We need the workflow run id
  const runId = parseInt(process.env.GITHUB_RUN_ID || "");
  if (Number.isNaN(runId)) return;

  // Fetch the workflow run
  const workflowRunResponse = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: runId,
  });

  // Find the check suite run
  console.log(`Workflow Run Response: ${workflowRunResponse.data.check_suite_url}`);
  const checkSuiteUrl = workflowRunResponse.data.check_suite_url;
  const checkSuiteId = parseInt(checkSuiteUrl.match(/[0-9]+$/)[0], 10);

  const checkRunsResponse = await octokit.rest.checks.listForSuite({
    owner,
    repo,
    check_name: "run-autograding-tests",
    check_suite_id: checkSuiteId,
  });

  // Filter to find the check run named "Autograding Tests" for the specific workflow run ID
  const checkRun = checkRunsResponse.data.total_count === 1 && checkRunsResponse.data.check_runs[0];

  if (!checkRun) return;

  // Update the checkrun, we'll assign the title, summary and text even though we expect
  // the title and summary to be overwritten by GitHub Actions (they are required in this call)
  // We'll also store the total in an annotation to future-proof
  const text = `Points ${totalPoints}/${maxPoints}`;
  await octokit.rest.checks.update({
    owner,
    repo,
    check_run_id: checkRun.id,
    output: {
      title: "Autograding",
      summary: text,
      text: JSON.stringify({ totalPoints, maxPoints }),
      annotations: [
        {
          // Using the `.github` path is what GitHub Actions does
          path: ".github",
          start_line: 1,
          end_line: 1,
          annotation_level: "notice",
          message: text,
          title: "Autograding complete",
        },
      ],
    },
  });
};


/***/ }),

/***/ 927:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 273:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 250:
/***/ ((module) => {

module.exports = eval("require")("cli-table3");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(927);
const { ConsoleResults } = __nccwpck_require__(27);
const { NotifyClassroom } = __nccwpck_require__(916);

try {
  const runnerResults = core
    .getInput("runners")
    .split(",")
    .map((runner) => {
      const encodedResults = process.env[`${runner.trim().toUpperCase()}_RESULTS`];
      const json = Buffer.from(encodedResults, "base64").toString("utf-8");
      return { runner, results: JSON.parse(json) };
    });


  ConsoleResults(runnerResults);
  core.setOutput("results", results);

  NotifyClassroom(runnerResults);

  if (runnerResults.some((r) => r.results.status === "fail")) {
    core.setFailed("Some tests failed.");
  } else if (runnerResults.some((r) => r.results.status === 'error')) {
    core.setFailed("Some tests errored.");
  }
} catch (error) {
  const input = core.getInput("runners");
  const pattern = /^([a-zA-Z0-9]+,)*[a-zA-Z0-9]+$/
  if (!pattern.test(input)) {
    console.error("The runners input must be a comma-separated list of strings.");
    core.setFailed("The runners input must be a comma-separated list of strings.");
  } else {
    console.error(error.message)
    core.setFailed(error.message);
  }
}

})();

module.exports = __webpack_exports__;
/******/ })()
;