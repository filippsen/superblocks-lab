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

import { h, Component } from 'preact';
// TODO: FIXME: pending style
//import style from './style-mocha';
import SuperProvider from '../superprovider';
import Web3 from 'web3';
// TODO: FIXME: replace with external tests provided by the user
import * as ExternalTests from './contracttester-external';

// TODO: FIXME: debug data
var debugData=[];
var debugSuccesses=0;
var debugFailures=0;

// TODO: FIXME: replace with external tests provided by the user
var user_action_before_test = ExternalTests.action_before;
// TODO: FIXME: replace with external tests provided by the user
var user_action_test = ExternalTests.action_test;
// TODO: FIXME: replace with external tests provided by the user
var user_action_after_test = ExternalTests.action_after;

function customOutput(data) {
    debugData.push(data);
    console.log(debugData);
}

function customIncrementSuccess() {
    debugSuccesses++;
    console.log("Increased success counter: " + debugSuccesses);
}

function customIncrementFailure() {
    debugFailures++;
    console.log("Increased failure counter: " + debugFailures);
}

function CustomReporter(runner) {
    //Base.call(this, runner);

    runner.on("pass", function(test){
        customOutput(test);
        customIncrementSuccess();
    });

    runner.on("fail", function(test, error){
        customOutput("failures and errors: ", test, error);
        customIncrementFailure();
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

function setup(web3, componentReference, action_before, action_test, action_after) {
    console.log("Setting up tests ...");

    // TODO: FIXME
    // cleanup debug data
    debugData=[];
    debugSuccesses=0;
    debugFailures=0;


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
    var ContractTesterLib = require("./contracttester-lib").default;
    const utilityLibrary = new ContractTesterLib();
    const testCode=`
        describe('User test action: manually check contract data', function (done) {
            var contractInstance;

            beforeEach(function (done) {
                // TODO: FIXME: access to compiler or pre-built data
                const contractBin = "0x6060604052341561000f57600080fd5b6040516103c13803806103c1833981016040528080518201919050508060009080519060200190610041929190610048565b50506100ed565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061008957805160ff19168380011785556100b7565b828001600101855582156100b7579182015b828111156100b657825182559160200191906001019061009b565b5b5090506100c491906100c8565b5090565b6100ea91905b808211156100e65760008160009055506001016100ce565b5090565b90565b6102c5806100fc6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633d7403a314610051578063e21f37ce146100ae575b600080fd5b341561005c57600080fd5b6100ac600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061013c565b005b34156100b957600080fd5b6100c1610156565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101015780820151818401526020810190506100e6565b50505050905090810190601f16801561012e5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80600090805190602001906101529291906101f4565b5050565b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101ec5780601f106101c1576101008083540402835291602001916101ec565b820191906000526020600020905b8154815290600101906020018083116101cf57829003601f168201915b505050505081565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061023557805160ff1916838001178555610263565b82800160010185558215610263579182015b82811115610262578251825591602001919060010190610247565b5b5090506102709190610274565b5090565b61029691905b8082111561029257600081600090555060010161027a565b5090565b905600a165627a7a72305820bb261bb5858618e117ce6751ee971eccf221b3efade6c29d04b739a5e37335ab00290000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c48656c6c6f20576f726c64210000000000000000000000000000000000000000";
                // TODO: FIXME: access to compiler or pre-built data
                const contractABI = [{"constant":false,"inputs":[{"name":"newMessage","type":"string"}],"name":"update","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"message","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"initMessage","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

                var account_nonce=0;
                web3.eth.getTransactionCount(accountAddress, function(error, result) {
                    if(error) {
                        done(new Error("Could not get nonce for address " + accountAddress));
                    } else {
                        account_nonce=result;

                        const gas_price="0x3B9ACA00";
                        const gas_limit="0x3b8260";
                        const tx=new Tx.Tx({
                            from: accountAddress,
                            value: "0x0",
                            nonce: account_nonce,
                            gasPrice: gas_price,
                            gasLimit: gas_limit,
                            data: contractBin,
                        });
                        tx.sign(Tx.Buffer.Buffer.from(accountKey, "hex"));

                        web3.eth.sendRawTransaction("0x"+tx.serialize().toString("hex"),
                            function(error, result) {
                                if(error) {
                                    console.error(error);
                                    done(error);
                                } else {
                                    var currentContractTransactionHash = result;

                                    function getTransactionReceipt(hash, cb) {
                                        web3.eth.getTransactionReceipt(hash,(err,res)=>{
                                            if(err || !res || !res.blockHash) {
                                                setTimeout(()=>{getTransactionReceipt(hash, cb)},100);
                                            }
                                            else  {
                                                cb(null, res);
                                            }
                                        });
                                    }

                                    getTransactionReceipt(currentContractTransactionHash, function(err, res) {
                                        if(err) {
                                            console.error(err);
                                            done(err);
                                        } else {
                                            var contract = web3.eth.contract(contractABI);
                                            contractInstance = contract.at(res.contractAddress);
                                            done();
                                        }
                                    });
                                }
                        });
                    }
                });
            });

            // NOTE: the following tests are intended
            //       to target the Hello World template
            it('matches message data', function (done) {
                var expectedValue = "Hello World!";
                contractInstance.message(function(error, result) {
                    if(error) {
                        console.error(error);
                        done(error);
                    } else {
                        if(result !== expectedValue) {
                            done(new Error(result));
                        } else {
                            done();
                        }
                    }
                });
            });

            // NOTE: the following tests are intended
            //       to target the Hello World template
            it('update message data', function (done) {
                const gas_price="0x3B9ACA00";
                const gas_limit="0x3b8260";
                var account_nonce=0;
                web3.eth.getTransactionCount(accountAddress, function(error, result) {
                    if(error) {
                        done(new Error("Could not get nonce for address " + accountAddress));
                    } else {
                        account_nonce=result;
                        var data = ABI.ABI.simpleEncode("update(string)", "Super Hello World!");
                        const tx=new Tx.Tx({
                            from: accountAddress,
                              to: contractInstance.address,
                              value: "0x0",
                              nonce: account_nonce,
                              gasPrice: gas_price,
                              gasLimit: gas_limit,
                              data: data,
                        });
                        tx.sign(Tx.Buffer.Buffer.from(accountKey, "hex"));

                        web3.eth.sendRawTransaction("0x"+tx.serialize().toString("hex"),
                            function(error, result) {
                                if(error) {
                                    console.error(error);
                                    done(error);
                                } else {
                                    contractInstance.message(function(error, result) {
                                        var expectedValue = "Super Hello World!";

                                        if(error) {
                                            console.error(error);
                                            done(error);
                                        } else {
                                            if(result !== expectedValue) {
                                                done(new Error(result));
                                            } else {
                                                // Yet another method for checking the previous assumption
                                                var method="message";
                                                var args=[];
                                                var expectedType=["string"];
                                                var expectedValue=["Super Hello World!"];
                                                utilityLibrary.assert_call(contractInstance, contractInstance.address, method, args, expectedType, expectedValue, done);
                                                done();
                                            }
                                        }
                                    });
                                }
                            }
                        );
                    }
                });
            });

            // NOTE: the following tests are intended
            //       to target the Hello World template
            it('repeat: matches message data', function (done) {
                var expectedValue = "Hello World!";
                contractInstance.message(function(error, result) {
                    if(error) {
                        console.error(error);
                        done(error);
                    } else {
                        if(result !== expectedValue) {
                            done(new Error(result));
                        } else {
                            done();
                        }
                    }
                });
            });
    });
    `;
    eval(testCode);

    // Invoke Mocha
    mocha.checkLeaks();
    mocha.run(function() {
        console.log("Tests are done!");
        componentReference.redraw(); // TODO: FIXME: debug force refresh here
    });


    return;
};

export default class ContractTester extends Component {
    constructor(props) {
        super(props);
        this.id = props.id+"_contracttester";
        this.props.parent.childComponent = this;
        this.dappfile = this.props.project.props.state.data.dappfile;
        this.provider = new SuperProvider({that:this});
        this.setState({
            account:0
        });
    }

    //
    // Internal helper functions
    // Note: the following functions were duplicated as-is
    // TODO: FIXME: consider reusing existing definitions from elsewhere
    getAccounts = (useDefault) => {
        var index=0;
        const ret=[{name:"(locked)",value:index++}];
        this.dappfile.accounts().map((account) => {
            ret.push({name:account.name,value:index++});
        })
        return ret;
    };

    _getAccount=()=>{
        const items=this.getAccounts().filter((item)=>{
            return this.state.account==item.value;
        });
        if(items.length>0) return items[0].name;
    };

    _getAccountAddress=()=>{
        // Check given account, try to open and get address, else return [].
        const accountName=this._getAccount();
        if(accountName=="(locked)") return [];
        if(!accountName) return [];

        const env=this.props.project.props.state.data.env;
        const account = this.dappfile.getItem("accounts", [{name: accountName}]);
        const accountIndex=account.get('index', env);
        const walletName=account.get('wallet', env);
        const wallet = this.dappfile.getItem("wallets", [{name: walletName}]);
        if(!wallet) {
            return [];
        }
        const walletType=wallet.get('type');

        if(walletType=="external") {
            // Metamask seems to always only provide one (the chosen) account.
            const extAccounts = web3.eth.accounts || [];
            if(extAccounts.length<accountIndex+1) {
                // Account not matched
                return [];
            }
            return [extAccounts[accountIndex]];
        }

        if(this.props.functions.wallet.isOpen(walletName)) {
            const address=this.props.functions.wallet.getAddress(walletName, accountIndex);
            return [address];
        }

        return [];
    };

    _getWeb3=(endpoint)=>{
        var provider;
        if(endpoint.toLowerCase()=="http://superblocks-browser") {
            provider=this.props.functions.EVM.getProvider();
        }
        else {
            var provider=new Web3.providers.HttpProvider(endpoint);
        }
        var web3=new Web3(provider);
        return web3;
    };

    _makeFileName=(path, tag, suffix)=>{
        const a = path.match(/^(.*\/)([^/]+)$/);
        const dir=a[1];
        const filename=a[2];
        return dir + "." + filename + "." + tag + "." + suffix;
    };

    redraw = () => {
        this.setState();
    };

    render() {
        // Prepare results
        // Note: depends on setup to finish in order to have information to present
        const scrollableId = this.id + "_scrollable";

        var testOutputData=[];
        for(var i=0; i<debugData.length; i++) {
            testOutputData.push(<br />);
            testOutputData.push(debugData[i].title);
            testOutputData.push(" | ");
            testOutputData.push(debugData[i].state);
            testOutputData.push(" | ");
            testOutputData.push(debugData[i].duration + "ms");
        }

        var testSuccessData = debugSuccesses;
        var testFailureData = debugFailures;

        const endpoint="http://superblocks-browser"; // TODO: support other networks
        const web3=this._getWeb3(endpoint);

        const runTestsButton=(
            <div style="color: #fff" class="scrollable-y" id={ scrollableId }>
                <button onClick={
                    () => {
                        { setup(web3, this, user_action_before_test, user_action_test, user_action_after_test) }
                    }
                }>
                    Run all
                </button>
                <br />
                <label> Tests: {testOutputData}</label>
                <br />
                <br />
                <label> Successes: {testSuccessData}</label>
                <label> Failures: {testFailureData}</label>
            </div>
        );

        return runTestsButton;
    }
}
