// Copyright 2018 Superblocks AB
//
// This file is part of Superblocks Studio.
//
// Superblocks Studio is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// Superblocks Studio is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Superblocks Studio.  If not, see <http://www.gnu.org/licenses/>.


// TODO: FIXME: debug data
var debugData=[];
var debugSuccesses=0;
var debugFailures=0;
var debugTotalTestCount=0;
var componentReference=null;
var reporterStatus="";

var testData = {};
function registerTest(key, test) {
    if(testData[key] === undefined) {
        testData[key] = {};
    }

    if(testData[key].tests === undefined) {
        testData[key].tests = [];
    }

    testData[key].tests.push(test);
}

function customReset() {
    // cleanup debug data
    debugData=[];
    debugSuccesses=0;
    debugFailures=0;
    reporterStatus="";
}

function customOutput(data) {
    debugData.push(data);
}

function customIncrementSuccess() {
    debugSuccesses++;
    console.log("Increased success counter: " + debugSuccesses);
}

function customIncrementFailure() {
    debugFailures++;
    console.log("Increased failure counter: " + debugFailures);
}

function customSetTotalTestCount(count) {
    debugTotalTestCount = count;
}

export function readReportOutput() {
    return debugData;
}

export function readReportSuccesses() {
    return debugSuccesses;
}

export function readReportFailures() {
    return debugFailures;
}

export function readTotalTestCount() {
    return debugTotalTestCount;
}

export function installComponentReferenceForDebugging(component) {
    componentReference = component;
}

export function readReporterStatus() {
    return reporterStatus;
}

export function CustomReporter(runner) {
    //Base.call(this, runner);

    runner.on("suite", function(suite){
        customOutput(suite);
        console.warn(suite);
        for(var i=0;i<suite.tests.length;i++) {
            console.warn("total tests: " + suite.tests[i].state);
        }
        const parentReference = suite.parent;
        if(parentReference) {
            const key=suite.parent.title.split(": ")[1]; // extract title
            if(suite.tests.length > 0) {
                customSetTotalTestCount(suite.tests.length);
                console.warn("total tests: " + readTotalTestCount());
                componentReference.redraw(); // TODO: FIXME: debug force refresh here
                for(var i=0;i<suite.tests.length;i++) {
                    registerTest(key, suite);
                }
            }
        }
    });

    runner.on("pass", function(test){
        customOutput(test);
        customIncrementSuccess();
    });

    runner.on("fail", function(test, error){
        customOutput(test);
        customIncrementFailure();
        console.error(error);

        var stack = error.stack.split("\n").map(
            function(line){
                return line.trim();
            }
        );

        var generatedError=stack[1].split("<anonymous>:")[1];
        if(generatedError){
            var reason=stack[0].split("Error: ")[1];
            var line=generatedError.split(":")[0];
            var column=generatedError.split(":")[1].split(")")[0];
            var errorOutput="Failure in line " + line + " column " + column + ". Reason: " + reason;
            console.error(errorOutput);
            reporterStatus = errorOutput;
        } else {
            reporterStatus = error;
        }
    });

    runner.on("start", function(){
        customReset();
    });

    runner.on("end", function(){
        console.log("finished: ", debugData, debugSuccesses, debugFailures, testData);
    });

    // TODO:
    // control other events here
    //
    //start: Execution started
    //suite: Test suite execution started
    //suite end: All tests (and sub-suites) have finished
    //test: Test execution started
    //test end: Test completed
    //hook: Hook execution started
    //hook end: Hook complete
    //pending: Test pending
}
