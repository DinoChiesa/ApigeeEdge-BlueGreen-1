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
// last saved: <2019-December-17 19:36:42>

const edgejs     = require('apigee-edge-js'),
      common     = edgejs.utility,
      apigeeEdge = edgejs.edge,
      util       = require('util'),
      path       = require('path'),
      Getopt     = require('node-getopt'),
      version    = '20191216-1313',
      proxyDir   = path.resolve(__dirname, '..'),
      settingsmap = 'settings',
      defaults = {weightoption:0},
      getopt     = new Getopt(common.commonOptions.concat([
        ['e' , 'env=ARG', 'required. the Apigee environment to provision for this example.'],
        ['W' , 'weightoption=ARG', 'optional. the weights option to provision. default: ' + defaults.weightoption],
        ['L' , 'listweightoptions', 'optional. list the weight options available for this example.'],
        ['' , 'updateweightsonly', 'optional. only update the weights. Do not import or deploy.']
      ])).bindHelp();

let weightoptions = [
      {
        "values" : [ [ "AAAAA", 50 ], [ "BBBBB", 30 ], [ "CCCCC", 10 ] ]
      },
      {
        "values" : [ [ "XXXX", 5 ], [ "YYY", 21 ], [ "ZZZ", 13 ] ]
      },
      {
        "values" : [ [ "A", 5 ], [ "B", 10 ] ]
      }
    ];

// ========================================================

function insureSettingsMap(org) {
  return Promise.resolve({})
    .then( _ => org.kvms.get({ environment: opt.options.env }))
    .then( r => {
      if (r.indexOf(settingsmap) == -1) {
        return org.kvms.create({ environment: opt.options.env, name: settingsmap, encrypted:false})
          .then( () => r );
      }
      return r;
    });
}

function storeWeights(org) {
  let weights = weightoptions[opt.options.weightoption];
  common.logWrite('storing: ' + JSON.stringify(weights));
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
    .then( _ => org.proxies.import({source:proxyDir}))
    .then( r => org.proxies.deploy({name:r.name, revision:r.revision, environment:opt.options.env }) );
}

console.log(
  'Apigee Edge Bluegreen Example Provisioning tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');
let opt = getopt.parse(process.argv.slice(2));
common.verifyCommonRequiredParameters(opt.options, getopt);

if (opt.options.listweightoptions) {
  for(var ix in weightoptions) {
    console.log(ix + ':');
    console.log(JSON.stringify(weightoptions[ix]));
    console.log();
  }
  process.exit(1);
}

if ( ! opt.options.env) {
  console.log('you must specify an environment.');
  getopt.showHelp();
  process.exit(1);
}

if (opt.options.weightoption) {
  opt.options.weightoption = Number(opt.options.weightoption);
  if (opt.options.weightoption < 0 || opt.options.weightoption >= weightoptions.length) {
    console.log('you must specify a valid weightoption.');
    getopt.showHelp();
    process.exit(1);
  }
}
else {
  opt.options.weightoption = defaults.weightoption;
}

apigeeEdge.connect(common.optToOptions(opt))
  .then( org =>
         Promise.resolve({})
         .then( _ => insureSettingsMap(org))
         .then( _ => storeWeights(org))
         .then( _ => opt.options.updateweightsonly || importAndDeploy(org) )
         .then( _ => {
           console.log();
           console.log('curl -i -X GET https://$ORG-$ENV.apigee.net/bluegreen/1');
           console.log();
         }))

  .catch( e => console.log(util.format(e)) );
