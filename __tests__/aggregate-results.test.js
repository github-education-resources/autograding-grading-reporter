const { getTableTotals } = require("../src/aggregate-results");
const { totalPercentageReducer } = require("../src/helpers/test-helpers");

test("test getTableTotals", function (done) {
  const mockRunnerResults = [
    {
      runner: "Test Runner 1",
      results: {
        version: 1,
        status: "pass",
        tests: [
          {
            name: "Test 1",
            status: "pass",
            message: null,
            line_no: null,
            execution_time: "0ms",
            score: 1,
          },
          {
            name: "Test 2",
            status: "fail",
            message: "Expected output not matched",
            line_no: 10,
            execution_time: "5ms",
            score: 0,
          },
        ],
        max_score: 2,
      },
    },
    {
      runner: "Test Runner 2",
      results: {
        version: 2,
        status: "fail",
        tests: [
          {
            name: "Test 3",
            status: "pass",
            message: null,
            line_no: null,
            execution_time: "0ms",
            score: 1,
          },
          {
            name: "Test 4",
            status: "fail",
            message: "Expected output not matched",
            line_no: 10,
            execution_time: "5ms",
            score: 0,
          },
        ],
        max_score: 2,
      },
    },
  ];
  const mockPushToTable = (row) => {
    console.log(row);
  };
  const result = getTableTotals(mockRunnerResults, mockPushToTable);
  expect(result).toStrictEqual([
    {
      score: 1,
      maxScore: 2,
      weight: "50.00",
    },
    {
      score: 1,
      maxScore: 2,
      weight: "50.00",
    },
  ]);
  const totalPercent = result.reduce(totalPercentageReducer, 0);
  expect(totalPercent).toBe(50);

  done();
});

test("test getTableTotals where weight is weird", function (done) {
  const mockRunnerResults = [
    {
      runner: "Runner 1",
      results: {
        version: 1,
        status: "pass",
        tests: [
          {
            name: "Test 1",
            status: "pass",
            message: null,
            line_no: null,
            execution_time: "0ms",
          },
          {
            name: "Test 2",
            status: "fail",
            message: "Expected output not matched",
            line_no: 10,
            execution_time: "5ms",
          },
        ],
        max_score: 2.5, // weird max_score
      },
    },
    {
      runner: "Runner 2",
      results: {
        version: 2,
        status: "fail",
        tests: [
          {
            name: "Test 3",
            status: "pass",
            message: null,
            line_no: null,
            execution_time: "0ms",
          },
          {
            name: "Test 4",
            status: "fail",
            message: "Expected output not matched",
            line_no: 10,
            execution_time: "5ms",
          },
        ],
        max_score: 3.3, // weird max_score
      },
    },
  ];

  const mockPushToTable = (row) => {
    console.log(row);
  };
  const result = getTableTotals(mockRunnerResults, mockPushToTable);
  expect(result).toStrictEqual([
    {
      score: 1.25,
      maxScore: 2.5,
      weight: "43.00",
    },
    {
      score: 1.65,
      maxScore: 3.3,
      weight: "57.00",
    },
  ]);
  done();
});
