var _ = require('lodash');
var fs = require("fs");
var    SCRIPT_TEST_DIR = './script-definition-tests/';

var testFilenames=fs.readdirSync("./tinytest-definition-tests");

var testsWithModuleFlag = ['handlebars-tests.ts', 'node-tests.ts', 'node-fibers-tests.ts'];


_.each(testFilenames, function(filename) {
	console.log('Running transpilation test: ' + filename);
	//var sys = require('sys');
	var exec = require('child_process').exec;

	function displayOutput(error, stdout, stderror) {
		if (stdout) console.log(stdout);
		if (error || stderror) { // Only display one of these to avoid duplication
			if (stderror) {
				console.log('Error: ' + stderror);
			} else {
				console.log('Error: ' + error);
			}
		}
	}

	if (_.contains(testsWithModuleFlag, filename)) {
		exec("tsc -m commonjs " + SCRIPT_TEST_DIR + filename, displayOutput);
	} else {
		exec("tsc " + SCRIPT_TEST_DIR + filename, displayOutput);

	}
});
