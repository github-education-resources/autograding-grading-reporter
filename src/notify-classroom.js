const core = require('@actions/core')
const github = require('@actions/github')

exports.NotifyClassroom = async function NotifyClassroom (runnerResults) {
  // combine max score and total score from each {runner, results} pair
  // if max_score is greater than 0 run the rest of this code
  const { totalScore, maxScore } = runnerResults.reduce((acc, { results }) => {
    if (!results.max_score) return acc

    acc.maxScore += results.max_score
    results.tests.forEach(({ score }) => {
      acc.totalScore += score
    })

    return acc
  }, { totalScore: 0, maxScore: 0 })
  console.log(`Total points: ${totalScore}/${maxScore}`)
  if (!maxScore) return

  // Our action will need to API access the repository so we require a token
  // This will need to be set in the calling workflow, otherwise we'll exit
  const token = process.env.GITHUB_TOKEN || core.getInput('token')
  console.log(`Token: ${token}`)
  if (!token || token === '') return

  // Create the octokit client
  const octokit = github.getOctokit(token)
  console.log(`Octokit: ${octokit}`)
  if (!octokit) return

  // The environment contains a variable for current repository. The repository
  // will be formatted as a name with owner (`nwo`); e.g., jeffrafter/example
  // We'll split this into two separate variables for later use
  const nwo = process.env.GITHUB_REPOSITORY || '/'
  const [owner, repo] = nwo.split('/')
  if (!owner) return
  if (!repo) return

  // We need the workflow run id
  const runId = parseInt(process.env.GITHUB_RUN_ID || '')
  console.log(`Run ID: ${runId}`)
  if (Number.isNaN(runId)) return

  // Fetch the workflow run
  const workflowRunResponse = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: runId,
  })

  console.log(`Check workflowRunResponse: ${workflowRunResponse.data.check_suite_url}`)
  // Find the check suite run
  const checkSuiteUrl = workflowRunResponse.data.check_suite_url
  const checkSuiteId = parseInt(checkSuiteUrl.match(/[0-9]+$/)[0], 10)
  console.log(`Check checkSuiteId: ${checkSuiteId}`)
  const checkRunsResponse = await octokit.rest.checks.listForSuite({
    owner,
    repo,
    check_name: 'autograding',
    check_suite_id: checkSuiteId,
  })

  console.log(`Check checkRunsResponse: ${checkRunsResponse.data.total_count}`)

  // Filter to find the check run named "Autograding Tests" for the specific workflow run ID
  const checkRun = checkRunsResponse.data.total_count === 1 && checkRunsResponse.data.check_runs[0]
  console.log(`Check run: ${checkRun}`)
  if (!checkRun) return

  // Update the checkrun, we'll assign the title, summary and text even though we expect
  // the title and summary to be overwritten by GitHub Actions (they are required in this call)
  // We'll also store the total in an annotation to future-proof
  const text = `Points ${totalScore}/${maxScore}`
  await octokit.rest.checks.update({
    owner,
    repo,
    check_run_id: checkRun.id,
    output: {
      title: 'Autograding',
      summary: text,
      text,
      annotations: [{
        // Using the `.github` path is what GitHub Actions does
        path: '.github',
        start_line: 1,
        end_line: 1,
        annotation_level: 'notice',
        message: text,
        title: 'Autograding complete'
      }]
    }
  })
}
