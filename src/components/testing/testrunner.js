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


import { CustomReporter } from "../testing/reporter";


var testRunnerStatus="";
export function readTestRunnerStatus() {
    return testRunnerStatus;
}


/*====================
  TestRunner

  Controls tests: initialize, start, stop, ...
=====================*/
export default class TestRunner {
    constructor() {
    }

    runAll(testCode, web3, componentReference, action_before, action_test, action_after) {
        console.log("Setting up tests ...");

        // TODO: FIXME: consider enabling custom account selection;
        //              See also: contractinteraction.js
        //
        // Reference:
    /*        const accountAddress=this._getAccountAddress();
        if(accountAddress.length==0) {
            accountAddress="0x0";
        }
        else {
            accountAddress=accountAddress[0];
        }*/
        const accountAddress="0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd";
        const accountKey="3867b6c26d09eda0a03e523f509e317d1656adc2f64b59f8b630c76144db0f17";

        //
        // Settings
        //const env=this.props.project.props.state.data.env;
        //const contract = this.dappfile.getItem("contracts", [{name: this.props.contract}]);
        //const src=contract.get('source');
        //const network=contract.get('network', env);
        //const endpoint=(this.props.functions.networks.endpoints[network] || {}).endpoint;
    //    const endpoint="http://superblocks-browser"; // TODO: support other networks
        //const web3=this._getWeb3(endpoint);

        //
        // Setup Mocha
        // TODO: FIXME: create, clone or none ?
        //var suiteInstance = mocha.suite.create(mochaInstance.suite, 'Test Suite');
        mocha.suite = mocha.suite.clone();
        mocha.setup('bdd');
        mocha.reporter(CustomReporter);

        var contract_name="HelloWorld";
        /*describe(contract_name, function(done) {
            before(function (done) {
                console.log('Preparing test suite...');
                this.timeout(0);

                if(action_before) {
                    action_before();
                }

                done();
            });

            it('Running test suite...', function (done) {
                console.log('Running test suite...');
                //action_test(web3, accountAddress, accountKey, done);
                done();
            });

            after(function (done) {
                console.log('Finalizing test suite...');

                if(action_after) {
                    action_after();
                }

                done();
            });
        });*/

        // TODO: FIXME: dynamically add tests
        // Note: alternatively, could use mocha.suite.addTest(new Test ... ), given it is possible to access the library
        //    const statement="describe(\"Hello World\", function(){var contractInstance;beforeEach(function(){console.warn(\"testing...\");});it(\"testing tests\",function(){console.log(true); }); });";
        var ABI = require('../../ethereumjs-abi-0.6.5.min.js');
        var Tx = require('../../ethereumjs-tx-1.3.3.min.js');
        var ContractTesterLib = require("../projecteditor/contracttester-lib").default;
        const utilityLibrary = new ContractTesterLib();

        describe("Contract name: " + contract_name, function() {
            testRunnerStatus="";
            try {
                eval(testCode);
            } catch(e) {
                testRunnerStatus="Invalid test file. " + e;
                console.error("testrunner error: ", e);
                componentReference.redraw(); // TODO: FIXME: debug force refresh here
                return;
            }
        });

        // Invoke Mocha
        mocha.checkLeaks();
        //mocha.allowUncaught();
        mocha.fullTrace();
        const runner = mocha.run(function() {
            console.log("Tests are done!");
            componentReference.redraw(); // TODO: FIXME: debug force refresh here
        });

        return;
    };

    runSingle(title, testCode, web3, componentReference, action_before, action_test, action_after) {
        console.log("Setting up tests ...");

        const accountAddress="0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd";
        const accountKey="3867b6c26d09eda0a03e523f509e317d1656adc2f64b59f8b630c76144db0f17";

        mocha.suite = mocha.suite.clone();
        mocha.setup('bdd');
        mocha.reporter(CustomReporter);

        var contract_name="HelloWorld";
        var ABI = require('../../ethereumjs-abi-0.6.5.min.js');
        var Tx = require('../../ethereumjs-tx-1.3.3.min.js');
        var ContractTesterLib = require("../projecteditor/contracttester-lib").default;
        const utilityLibrary = new ContractTesterLib();

        console.warn(typeof(testCode));
        // TODO: FIXME: consider multiple occurrences
        //              consider case (in)sensitive
        //              consider single and double quotes
        console.warn(title);
        const regex = new RegExp("it*.\'" + title + "\'*.,{1}");
        const replaceWith = 'it.only("' + title + '",';
        const singleTestCode = testCode.replace(regex, replaceWith);
        console.warn("single test code: ", singleTestCode);

        describe("Contract name: " + contract_name, function() {
            testRunnerStatus="";
            try {
                eval(singleTestCode);
            } catch(e) {
                testRunnerStatus="Invalid test file. " + e;
                console.error("caught an error: ", testRunnerStatus);
                componentReference.redraw(); // TODO: FIXME: debug force refresh here
                return;
            }

        });

        // Invoke Mocha
        mocha.checkLeaks();
        //mocha.allowUncaught();
        mocha.fullTrace();
        mocha.run(function() {
            console.log("Tests are done!");
            componentReference.redraw(); // TODO: FIXME: debug force refresh here
        });


        return;
    };
}
