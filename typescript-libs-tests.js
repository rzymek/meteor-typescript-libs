TEST_DIR = 'assets/packages/local-test_meteortypescript_typescript-libs/definition-tests/';

var testFilenames = [
  'meteor-tests.ts',
  'backbone-tests.ts',
  'bootstrap-tests.ts',
  'd3-tests.ts',
  'handlebars-tests.ts',
  'jquery-tests.ts',
  'node-fibers-tests.ts',
  'node-tests.ts',
  'underscore-tests.ts',
  'underscore.string-tests.ts'
];
var testsWithModuleFlag = [
  'handlebars-tests.ts',
  'node-tests.ts',
  'node-fibers-tests.ts'
];

var fs = Npm.require('fs');
var exec = Npm.require('exec');

exec('pwd', function(error, stdout, stderror) {
  console.log('Executing in directory: ' + stdout);
});

testFilenames.forEach(function (testFilename) {
  var command;
  if (_.indexOf(testsWithModuleFlag, testFilename) != -1) {
    command = 'tsc -m commonjs ' + TEST_DIR + testFilename;
  } else {
    command = 'tsc '+ TEST_DIR + testFilename;
  }

  var resultFilename = testFilename.replace('.ts', '.js');
  var resultFilePath = TEST_DIR + resultFilename;
  try {
    fs.openSync(resultFilePath, 'r');
    fs.renameSync(resultFilePath, resultFilePath + '.old');
  } catch(e) {} // file not there -- die quietly

  Tinytest.addAsync('Transpile ' + testFilename, function(test, done) {
    exec(command, Meteor.bindEnvironment(function (error, stdout, stderror) {
      if (stdout) {
        console.log(JSON.stringify(stdout));
        test.isTrue(false, JSON.stringify(stdout, null, 4));
      }
      if (error || stderror) { // Only display one of these to avoid duplication
        if (stderror) {
          console.log('Error: ' + JSON.stringify(stderror));
          test.isTrue(false, 'Error: ' + stderror);
        } else {
          console.log('Error: ' + JSON.stringify(error));
          test.isTrue(false, 'Error: ' + error);
        }
      } else {
        try {
          fs.openSync(resultFilePath, 'r');
        } catch (e) {
          test.isTrue(false, "Could not find test result file " + resultFilePath);
        }
      }
      done();
    }, function () { console.log('Failed to bind environment'); }));
  });
});