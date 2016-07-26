// selectTarget.js
// ------------------------------------------------------------------
//
// created: Wed Jan 13 12:12:56 2016
// last saved: <2016-June-08 12:31:47>

if ('' + properties.weightsResponse != "undefined") {
  // retrieve weights, from BaaS
  var weightsResponse = context.getVariable(properties.weightsResponse);
  weightsResponse = JSON.parse(weightsResponse);

  if (weightsResponse.entities && weightsResponse.entities[0]) {
    var entity = weightsResponse.entities[0];
    var wrs = new WeightedRandomSelector(entity.values);
    var selected = wrs.select();
    context.setVariable('selectedTarget', selected[0]);
  }
}
