/**
 *
 * Copyright 2016-present reading
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { Eos } from "react-native-eosjs";

var MD5 = require("crypto-js/md5");
var CryptoJS = require("crypto-js");
var RSAKey = require('react-native-rsa');

export const EosUpdateAuth = (account, pvk, auth, callback) => { 
  if (account == null) {
    if(callback) callback("无效账号");
    return;
  };

  Eos.transaction({
      actions: [
          {
              account: "eosio",
              name: "updateauth", 
              authorization: [{
              actor: account,
              permission: 'active'
              }], 
              data: {
                  account: account,
                  permission: 'active',
                  parent: "owner",
                  auth: auth,
                  // auth: {
                  //   threshold: 1,
                  //   keys: [
                  //       {
                  //           key: this.props.defaultWallet.activePublic,
                  //           weight: 1,
                  //       }
                  //   ],
                  //   accounts: [
                  //       {
                  //           permission: {
                  //               actor: "etbexchanger",
                  //               permission: "eosio.code",
                  //           },
                  //           weight: 1,
                  //       }
                  //   ],
                  // },
              }
          }
      ]
  }, pvk, (r) => {
    if(callback) callback(r);
  });
};