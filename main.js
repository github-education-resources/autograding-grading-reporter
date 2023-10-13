const core = require('@actions/core');

function runAction() {
  const runners = core.getInput('runners', { required: true });
  console.log("runners: ", runners);
}

runAction();
