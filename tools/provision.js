#! /usr/local/bin/node

// provision.js
// ------------------------------------------------------------------
// provision a KVM setting for the bluegreen example.
//
// Copyright 2017-2019 Google LLC.
//

/* jshint esversion: 9, strict:implied, node:true */

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// last saved: <2019-December-16 13:27:18>

const edgejs     = require('apigee-edge-js'),
      common     = edgejs.utility,
      apigeeEdge = edgejs.edge,
      util       = require('util'),
      path       = require('path'),
      Getopt     = require('node-getopt'),
      version    = '20191216-1313',
      proxyDir   = path.resolve(__dirname, '..'),
      settingsmap = 'settings',
      getopt     = new Getopt(common.commonOptions.concat([
        ['e' , 'env=ARG', 'required. the Apigee environment to provision for this example. ']
      ])).bindHelp();

let weights =         {
          "values" : [ [ "AAAAA", 50 ], [ "BBBBB", 30 ], [ "CCCCC", 10 ] ]
    };

// ========================================================

function insureOneMap(org, r, mapname, encrypted) {
  if (r.indexOf(mapname) == -1) {
    return org.kvms.create({ environment: opt.options.env, name: mapname, encrypted})
      .then( () => r );
  }
  return r;
}

function storeWeights(org) {
  return Promise.resolve({})
    .then( _ => org.kvms.put({
        environment: opt.options.env,
        kvm: settingsmap,
        key: 'targets-and-weights',
      value: JSON.stringify(weights)
    }));
}

function importAndDeploy(org) {
  return Promise.resolve({})
    .then(_ => org.proxies.import({source:proxyDir}))
    .then( result => org.proxies.deploy({name:result.name, revision:result.revision, environment:opt.options.env }) );
}

console.log(
  'Apigee Edge Bluegreen Example Provisioning tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');
let opt = getopt.parse(process.argv.slice(2));
common.verifyCommonRequiredParameters(opt.options, getopt);

if ( ! opt.options.env) {
  console.log('you must specify an environment.');
  getopt.showHelp();
  process.exit(1);
}

apigeeEdge.connect(common.optToOptions(opt))
  .then( org =>
         Promise.resolve({})
         .then( _ => org.kvms.get({ environment: opt.options.env }))
         .then( r => insureOneMap(org, r, settingsmap, false))
         .then( _ => storeWeights(org))
         .then( _ => importAndDeploy(org))
         .then( _ => {
           console.log('curl -i -X GET "https://$ORG-$ENV.apigee.net/bluegreen/1"');
           console.log();
         }))

  .catch( e => console.log(util.format(e)) );
