## GitHub Classroom Autograding Reporter

### Overview
**GitHub Classroom Autograding Reporter** is a plugin for GitHub Classroom's Autograder. Use it to report the results of the test execution to students and GitHub Classroom.

### Key Features
- **Automatic Grading**: Test student code submissions and provide immediate feedback.
- **Customizable Test Setup**: Define pre-test setup commands and specific testing commands.
- **Flexible Output Comparison**: Supports multiple methods to compare the stdout output.
- **Timeout Control**: Limit the runtime of tests to prevent excessive resource usage.

### Inputs

| Input Name | Description | Required |
|------------|-------------|----------|
| `runners` | A comma separated list of runner ids from previous steps  | Yes |

### Outputs
```
🔄 Processing: shout-test
✅ Shout Test

Total points for shout-test: 100.00/100

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: a-command-test
✅ A command test

Total points for a-command-test: 100.00/100

🏆 Grand Total Points: 100.00/100

 Test Runner Summary 
┌────────────────────┬─────────────┬─────────────┬──────────┐
│ Test Runner Name   │ Test Score  │ Max Score   │ Weight   │
├────────────────────┼─────────────┼─────────────┼──────────┤
│ shout-test         │ 100         │ 100         │ 50.0     │
├────────────────────┼─────────────┼─────────────┼──────────┤
│ a-command-test     │ 100         │ 100         │ 50.0     │
├────────────────────┼─────────────┼─────────────┼──────────┤
│ Total:             │ ----        │ ----        │ 100.00%  │
└────────────────────┴─────────────┴─────────────┴──────────┘
```

### Usage

1. Add the GitHub Classroom Reporter to your workflow.

```yaml
name: Autograding Tests

on:
  push

jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Run Autograding Tests
      uses: education/autograding-io-grader@v1
      with:
        test-name: 'Test Name'
        command: './bin/shout'
        input: 'hello'
        expected-output: 'HELLO'
        comparison-method: 'exact'
    - name: Autograding Reporter
      uses: education/autograding-grading-reporter@v1
      env:
        SHOUT-TEST_RESULTS: "${{steps.shout-test.outputs.result}}"
        A-COMMAND-TEST_RESULTS: "${{steps.a-command-test.outputs.result}}"
      with:
        runners: shout-test,a-command-test
      
