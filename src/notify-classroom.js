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
  if (!maxScore) return

  // Our action will need to API access the repository so we require a token
  // This will need to be set in the calling workflow, otherwise we'll exit
  const token = process.env.GITHUB_TOKEN || core.getInput('token')
  if (!token || token === '') return

  // Create the octokit client
  const octokit = github.getOctokit(token)
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
  if (Number.isNaN(runId)) return

  // List check runs for the repository
  const checkRunsResponse = await octokit.rest.checks.listForRepo({
    owner,
    repo,
    check_name: 'Autograding Tests'
  })

  // Filter to find the check run named "Autograding Tests" for the specific workflow run ID
  const checkRun = checkRunsResponse.data.check_runs.find(cr => cr.name === 'Autograding Tests' && cr.check_suite.workflow_run_id === runId)

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
