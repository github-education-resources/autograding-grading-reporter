const core = require("@actions/core");
const { ConsoleResults } = require("./console-results");
const { NotifyClassroom } = require("./notify-classroom");
const { AggregateResults } = require("./aggregate-results");

function parseRunnerResults(runners) {
  try {
    const returnRunners = runners.split(",").map((runner) => {
      const encodedResults = process.env[`${runner.trim().toUpperCase()}_RESULTS`];
      const json = Buffer.from(encodedResults, "base64").toString("utf-8");
      return { runner: runner.trim(), results: JSON.parse(json) };
    });
    return returnRunners;
  } catch (error) {
    throw new Error("The runners input must be a comma-separated list of strings.");
  }
}
exports.parseRunnerResults = parseRunnerResults;

async function main() {
  try {
    const runnerResults = parseRunnerResults(core.getInput("runners"));

    ConsoleResults(runnerResults);
    AggregateResults(runnerResults);

    try {
      await NotifyClassroom(runnerResults);
    } catch (error) {
      console.error("Error in NotifyClassroom:", error);
    }

    if (runnerResults.some((r) => r.results.status === "fail")) {
      core.setFailed("Some tests failed.");
    }
  } catch (error) {
    console.error(error.message);
    core.setFailed(error.message);
  }
}

main();
