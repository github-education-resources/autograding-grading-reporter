const core = require('@actions/core');
const { ConsoleResults } = require('./console-results');

try {
    const runner_results = core.getInput('runners').split(',').map((runner) => {
        const encodedResults = process.env[`${runner.toUpperCase()}_RESULTS`];
        const json = Buffer.from(encodedResults, 'base64').toString('utf-8');
        return JSON.parse(json);
    })
    ConsoleResults(runner_results);

    if (true) {
        core.setFailed("Some tests failed.");
    }
} catch (error) {
    core.setFailed(error.message);
}
