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
import MonacoEditor from 'react-monaco-editor';
import TestRunner from "../testing/testrunner";
import {readTestRunnerStatus} from "../testing/testrunner";

import { readReporterStatus, readReportOutput, readReportSuccesses, readReportFailures, readTotalTestCount, installComponentReferenceForDebugging } from "../testing/reporter";

var testCode=`
    describe('User-created test block: manually check contract data', function (done) {
        var contractInstance;

        beforeEach(function (done) {
            // TODO: FIXME: constructor parameters
            const contractBin = HelloWorld.bin + "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c48656c6c6f20576f726c64210000000000000000000000000000000000000000";
            const contractABI = HelloWorld.abi;

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

function readTestCode() {
    return testCode;
}

function storeTestCode(data) {
    testCode = data;
}

// TODO: FIXME: replace with external tests provided by the user
var user_action_before_test = ExternalTests.action_before;
// TODO: FIXME: replace with external tests provided by the user
var user_action_test = ExternalTests.action_test;
// TODO: FIXME: replace with external tests provided by the user
var user_action_after_test = ExternalTests.action_after;

/*=====================
  ContractTester

  Reference rendering component (for development and demo only)
=====================*/
// TODO: rename to TestReferenceComponent or something else
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

        this.testRunner = new TestRunner();
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

    _loadFiles=(files, cb)=>{
        const bodies=[];
        var fn;
        fn=((files, bodies, cb2)=>{
            if(files.length==0) {
                cb2(0);
                return;
            }
            const file=files.shift();
            this.props.project.loadFile(file, (body) => {
                if(body.status!=0) {
                    cb(1);
                    return;
                }
                bodies.push(body.contents);
                fn(files, bodies, (status)=>{
                    cb2(status);
                });
            }, true, true);
        });
        fn(files, bodies, (status)=>{
            cb(status, bodies);
        });
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

        // TODO: FIXME: move out of rendering code
        var testOutputData=[];
        var debugData = readReportOutput();
        for(var i=0; i<debugData.length; i++) {
            testOutputData.push(<br />);
            if(debugData[i].state === undefined) {
                testOutputData.push(debugData[i].title);
            } else if(debugData[i].title !== "") {
                testOutputData.push(<span style="width:20px;display:inline-block"></span>);
                testOutputData.push("* ");
                testOutputData.push(" | ");
                const state = debugData[i].state;
                if(state === "passed") {
                    testOutputData.push(<label style="color: lightgreen">OK</label>);
                } else {
                    testOutputData.push(<label style="color: red">FAIL</label>);
                }
                testOutputData.push(" | ");
                testOutputData.push(debugData[i].title);
                testOutputData.push(" (");
                testOutputData.push(debugData[i].duration + "ms");
                testOutputData.push(")");
// TODO: FIXME: hardcoded debugging
if(i === 3) {
        testOutputData.push(<button onClick={
            () => {
                { this.testRunner.runSingle(debugData[3].title, testCode, contractsData, accountAddress, accountKey, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
            }
        }>
        Rerun
        </button>
        );
} else if(i === 4) {
        testOutputData.push(<button onClick={
            () => {
                { this.testRunner.runSingle(debugData[4].title, testCode, contractsData, accountAddress, accountKey, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
            }
        }>
        Rerun
        </button>
        );
} else if(i === 5) {
        testOutputData.push(<button onClick={
            () => {
                { this.testRunner.runSingle(debugData[5].title, testCode, contractsData, accountAddress, accountKey, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
            }
        }>
        Rerun
        </button>
        );
} else {
    console.error(i);
}

            } else {
                console.error(debugData[i]);
            }
        }

        var testSuccessData = readReportSuccesses();
        var testFailureData = readReportFailures();
        var testTotalCount = testSuccessData + testFailureData;
        var totalTestCount = readTotalTestCount();
        installComponentReferenceForDebugging(this);
        var testRunnerStatus = readTestRunnerStatus().toString();
        var reporterStatus = readReporterStatus();

        var availableContracts={};
        var availableContractsData=[];
        var availableContractNames=[];
        var availableContractSources=[];
        const contracts=this.dappfile.contracts();
        for(var index=0;index<contracts.length;index++) {
            const item = contracts[index];
            availableContractNames.push(item.name);
            availableContractSources.push(item.source);
            availableContractsData.push(<br />);
            availableContractsData.push(<span style="width:20px;display:inline-block"></span>);
            availableContractsData.push("* ");

            availableContractsData.push(item.name);
        }

        this._loadFiles(availableContractSources, (status, bodies) => {
            // TODO: FIXME: error handling
            //              check status
            for(var index=0;index<contracts.length;index++) {
                const name = availableContractNames[index];
                const source = bodies[index];
                availableContracts[name] = source;
            }
        });

        // TODO: FIXME: move out of render context
        // take network into account
        // traverse all files

        var mustCompileFirst="";
        var contractsData={};
        const contractName="HelloWorld";
        contractsData[contractName]={};
        const filename="/contracts/."+contractName+".sol";
        const network="browser";
        const filetypeABI="abi";
        const filetypeBin="bin";
        const fileABI=filename+"."+network+"."+filetypeABI;
        const fileBin=filename+"."+network+"."+filetypeBin;
        this.props.project.loadFile(fileABI, (abi) => {
            if(abi.status!=0) {
                mustCompileFirst="ABI file not found: " + fileABI + ". Compile " + contractName + " before testing.";
                return;
            }

            this.props.project.loadFile(fileBin, (bin) => {
                if(bin.status!=0) {
                    mustCompileFirst="Binary file not found: " + fileBin + ". Compile " + contractName + " before testing.";
                    return;
                }

                contractsData[contractName]={
                    abi: JSON.parse(abi.contents),
                    bin: bin.contents
                };
            });
        });

        const accountAddress="0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd";
        const accountKey="3867b6c26d09eda0a03e523f509e317d1656adc2f64b59f8b630c76144db0f17";
        const endpoint="http://superblocks-browser"; // TODO: support other networks
        const web3=this._getWeb3(endpoint);

        const mustCompileFirstOutput=(
            <div style="color: #fff" class="scrollable-y" id={ scrollableId }>
                  <MonacoEditor
                    key={this.id}
                    height="500"
                    language="js"
                    theme="vs-dark"
                    value={ readTestCode() }
                    onChange={(value)=>storeTestCode(value)}
                    options={ { selectOnLineNumbers: true } }
                  />

                <button onClick={
                      () => {
                          { this.testRunner.runAll(testCode, contractsData, accountAddress, accountKey, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
                    }
                }>
                    Run all
                </button>
                <hr />
                <label style="color:red"> { mustCompileFirst } </label>
            </div>
        );

        const runTestsButton=(
            <div style="color: #fff" class="scrollable-y" id={ scrollableId }>
                  <MonacoEditor
                    key={this.id}
                    height="500"
                    language="js"
                    theme="vs-dark"
                    value={ readTestCode() }
                    onChange={(value)=>storeTestCode(value)}
                    options={ { selectOnLineNumbers: true } }
                  />

                <button onClick={
                      () => {
                          { this.testRunner.runAll(testCode, contractsData, accountAddress, accountKey, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
                    }
                }>
                    Run all
                </button>
                <hr />
                <label><b>endpoint:</b> {endpoint} | <b>network:</b> {network}</label>
                <br />
                <label><b>accountAddress:</b> {accountAddress} </label>
                <br />
                <br />
                <label><b>At disposal:</b> {availableContractsData}</label>
                <br />
                <br />

                <label> <b>[Tests]</b> Done {testTotalCount} of {totalTestCount} tests</label>
                <br />
                <br />
                <label><i>HelloWorld.test.js</i> {testOutputData}</label>
                <hr />
                <label> <b>[Test Summary]</b></label>
                <label> {testSuccessData} passed</label>
                <label> {testFailureData} failed</label>
                <label> {testTotalCount} total</label>
                <hr />
                <label> <b>[Output console]</b></label>
                <br />
                <label style="color:red"> {testRunnerStatus} </label>
                <label style="color:red"> {reporterStatus} </label>
            </div>
        );

        if(mustCompileFirst !== "") {
            return mustCompileFirstOutput;
        } else {
            return runTestsButton;
        }
    }
}
