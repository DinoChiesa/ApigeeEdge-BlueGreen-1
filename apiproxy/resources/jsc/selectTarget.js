// selectTarget.js
// ------------------------------------------------------------------
//
// created: Wed Jan 13 12:12:56 2016
// last saved: <2017-April-21 15:32:53>

function selectTarget(values) {
    var wrs = new WeightedRandomSelector(values);
    var selected = wrs.select();
    context.setVariable('selectedTarget', selected[0]);
}

if ('' + properties.weights != "undefined") {
  // retrieve weights
  var weightsData = context.getVariable(properties.weights);
  weightsData = JSON.parse(weightsData);

  if (weightsData.entities && weightsData.entities[0]) {
    // obtained from BaaS
    var entity = weightsData.entities[0];
    selectTarget(entity.values);
  }
  else if (weightsData.values){
    // obtained from KVM
    selectTarget(weightsData);
  }
}
