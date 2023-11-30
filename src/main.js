const core = require("@actions/core");
const { ConsoleResults } = require("./console-results");
const { NotifyClassroom } = require("./notify-classroom");
const { AggregateResults } = require("./aggregate-results");

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
  NotifyClassroom(runnerResults);
  AggregateResults(runnerResults);

  if (runnerResults.some((r) => r.results.status === "fail")) {
    core.setFailed("Some tests failed.");
  }
} catch (error) {
  const input = core.getInput("runners");
  const pattern = /^([^,]+,)*[^,]+$/;
  if (!pattern.test(input)) {
    console.log("HERE")
    console.error("The runners input must be a comma-separated list of strings.");
    core.setFailed("The runners input must be a comma-separated list of strings.");
  } else {
    console.log("HERE1")
    console.error(error.message)
    core.setFailed(error.message);
  }
}
