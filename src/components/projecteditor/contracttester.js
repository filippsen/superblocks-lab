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
import Mocha from '../../mocha.js';
// TODO: FIXME: replace with external tests provided by the user
import * as ExternalTests from './contracttester-external';

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

        // TODO: FIXME: replace with external tests provided by the user
        var user_action_before_test = ExternalTests.action_before;
        // TODO: FIXME: replace with external tests provided by the user
        var user_action_test = ExternalTests.action_test;
        // TODO: FIXME: replace with external tests provided by the user
        var user_action_after_test = ExternalTests.action_after;

        this.setup(user_action_before_test, user_action_test, user_action_after_test);
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

    setup(action_before, action_test, action_after) {
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
        const env=this.props.project.props.state.data.env;
        const contract = this.dappfile.getItem("contracts", [{name: this.props.contract}]);
        const src=contract.get('source');
        const network=contract.get('network', env);
        const endpoint=(this.props.functions.networks.endpoints[network] || {}).endpoint;
        const web3=this._getWeb3(endpoint);

        //
        // Load contract ABI
        var contract_abi;
        const abisrc=this._makeFileName(src, env, "abi");
        this.props.project.loadFile(abisrc, (body) => {
            if(body.status != 0) {
                console.error("Unable to read contract ABI. Make sure the contract is deployed");
                this.status=1;
                return;
            }

            //
            // Retrieve ABI
            contract_abi = body.contents;

            if(!contract_abi) {
                console.error("Unable to read contract ABI. Make sure the contract is deployed");
                this.status=1;
                return;
            }

            //
            // Store parsed ABI as interface for currently selected contract
            var contract_interface = JSON.parse(contract_abi);

            //
            // Retrieve contract address
            const addresssrc=this._makeFileName(src, env+"."+network, "address");
            this.props.project.loadFile(addresssrc, (body) => {
                if(body.status != 0) {
                    console.error("Unable to read contract address. Make sure the contract is deployed");
                    this.status=2;
                    return;
                }

                const contractAddress = body.contents;

                if(!contractAddress) {
                    console.error("Unable to read contract address. Make sure the contract is deployed");
                    this.status=2;
                    return;
                }

                // Store instance for the contract located at specific address
                const contractInstance = web3.eth.contract(contract_interface).at(contractAddress);

                //
                // Setup Mocha
                mocha.suite = mocha.suite.clone();
                mocha.setup('bdd');

                var contract_name=this.props.contract;
                describe(contract_name, function(done) {
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
                        action_test(web3, contractInstance, contractAddress, accountAddress, accountKey, done);
                        done();
                    });

                    after(function (done) {
                        console.log('Finalizing test suite...');

                        if(action_after) {
                            action_after();
                        }

                        done();
                    });
                });

                // Invoke Mocha
                mocha.checkLeaks();
                mocha.run();

                // Finish
                this.status=0;
                return;
            });
        });
    };

    redraw = () => {
        this.setState();
    };

    render() {
        // TODO: FIXME: possibility to block further testing by checking for existing report
        //if(document.getElementById("mocha-report") === null)
        //or dappfile contains specific state
        //    return;


        // Prepare results
        // Note: depends on setup to finish in order to have information to present
        const scrollableId = this.id + "_scrollable";
        const unableToReadABI=(
            <div class="scrollable-y" id={ scrollableId }>
                <h1>Unable to read contract ABI. Make sure the contract is deployed</h1>
            </div>
        );
        const unableToReadAddress=(
            <div class="scrollable-y" id={ scrollableId }>
                <h1>Unable to read contract address. Make sure the contract is deployed</h1>
            </div>
        );
        const reportData=(
            <div class="scrollable-y" id={ scrollableId }>
                <div id="mocha">
                </div>
            </div>
        );

        // Output
        if(this.status == 1) {
            return unableToReadABI;
        } else if(this.status == 2) {
            return unableToReadAddress;
        } else {
            return reportData;
        }
    }
}
