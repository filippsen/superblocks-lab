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

import ContractTesterLib from './contracttester-lib';
// TODO: FIXME: move dependencies to library
import ABI from '../../ethereumjs-abi-0.6.5.min.js';
// TODO: FIXME: move dependencies to library
import Tx from '../../ethereumjs-tx-1.3.3.min.js';

//
// NOTE: the following functions are to be provided by the user 

// NOTE: this represents a function provided by the user to be executed after tests
export function action_before() {
    describe('User action before tests', function () {
        it('should test a pre-test', function () {
            if(false) {
                throw new Error("Unexpected error");
            }
        })
    });
}

// NOTE: this represents a function provided by the user to be executed after tests
export function action_after() {
    describe('User action after tests', function () {
        it('should test a post-test', function () {
            if(false) {
                throw new Error("Unexpected error");
            }
        })
    });
}

// NOTE: this represents a function provided by the user to be executed 
//       as part of the main set of tests
export function action_test(web3, instance, contract_address, account_address, account_key, done) {
    // Instantiate the library
    // make it available to user
    const utilityLibrary = new ContractTesterLib();

    describe('User test action: manually check contract data', function (done) {
        // NOTE: the following tests are intended
        //       to target the Hello World template
        it('matches message data', function (done) {
            var expectedValue = "Hello World!";
            instance.message(function(error, result) {
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

        // TODO: FIXME: mutates data
        //              check assumption within the same context
        //              needs a reset before or afterwards
        //
        it('update message data', function (done) {
            const gas_price="0x3B9ACA00";
            const gas_limit="0x3b8260";
            var account_nonce=0;

            // TODO: FIXME: consider providing a helper function for the following code ?
            web3.eth.getTransactionCount(account_address, function(error, result) {
                if(error) {
                    done(new Error("Could not get nonce for address " + account_address));
                } else {
                    account_nonce=result;
                    // TODO: FIXME: offer as library call
                    var data = ABI.ABI.simpleEncode("update(string)", "Super Hello World!");
                    const tx=new Tx.Tx({
                        from: account_address,
                        to: contract_address,
                        value: "0x0",
                        nonce: account_nonce,
                        gasPrice: gas_price,
                        gasLimit: gas_limit,
                        data: data,
                    });
                    tx.sign(Tx.Buffer.Buffer.from(account_key, "hex"));

                    web3.eth.sendRawTransaction("0x"+tx.serialize().toString("hex"),
                        function(error, result) {
                            if(error) {
                                console.error(error);
                                done(error);
                            } else {
                                done();
                            }
                        }
                    );
                }
            });
        });

        // TODO: FIXME: relies on previously mutated data
        it('matches updated message data', function (done) {
            // NOTE: this is a test for Hello World template
            var expectedValue = "Super Hello World!";
            instance.message(function(error, result) {
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

    // TODO: FIXME: relies on previously mutated data
    describe('User test action: check contract data via assert_call', function (done) {
        // NOTE: this is a test for Hello World template
        // TODO: FIXME: simplify assert_call to minimize number of parameters 
        //              (consider implicit instance and address ?)

        var method="message";
        var args=[];
        var expectedType=["string"];
        var expectedValue=["Super Hello World!"];
        utilityLibrary.assert_call(instance, contract_address, method, args, expectedType, expectedValue, done);
    });
}
