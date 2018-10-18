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
import { readReportOutput, readReportSuccesses, readReportFailures } from "../testing/reporter";

var testCode=`
    describe('User-created test block: manually check contract data', function (done) {
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
                testOutputData.push(debugData[i].title);
                testOutputData.push(" | ");
                testOutputData.push(debugData[i].state);
                testOutputData.push(" | ");
                testOutputData.push(debugData[i].duration + "ms");
            } else {
                console.error(debugData[i]);
            }
        }

        var testSuccessData = readReportSuccesses();
        var testFailureData = readReportFailures();

        const endpoint="http://superblocks-browser"; // TODO: support other networks
        const web3=this._getWeb3(endpoint);

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
                        { this.testRunner.runAll(testCode, web3, this, user_action_before_test, user_action_test, user_action_after_test) }
                    }
                }>
                    Run all
                </button>
                <hr />
                <label> [Test output] {testOutputData}</label>
                <hr />
                <label> {testSuccessData} passed</label>
                <label> {testFailureData} failed</label>
                <label> {testSuccessData + testFailureData} total</label>
            </div>
        );

        return runTestsButton;
    }
}
