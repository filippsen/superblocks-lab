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

function customReset() {
    // cleanup debug data
    debugData=[];
    debugSuccesses=0;
    debugFailures=0;
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

export function readReportOutput() {
    return debugData;
}

export function readReportSuccesses() {
    return debugSuccesses;
}

export function readReportFailures() {
    return debugFailures;
}

export function CustomReporter(runner) {
    //Base.call(this, runner);

    runner.on("suite", function(suite){
        customOutput(suite);
        console.warn(suite);
    });


    runner.on("pass", function(test){
        customOutput(test);
        customIncrementSuccess();
    });

    runner.on("fail", function(test, error){
        customOutput(test);
        customIncrementFailure();
    });

    runner.on("start", function(){
        customReset();
    });

    runner.on("end", function(){
        console.log("finished: ", debugData, debugSuccesses, debugFailures);
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


