// selectTarget.js
// ------------------------------------------------------------------
/* global context, properties, WeightedRandomSelector */

function selectTarget(values) {
    var wrs = new WeightedRandomSelector(values);
    var selected = wrs.select();
    context.setVariable('selectedTarget', selected[0]);
}

if ('' + properties.weights != "undefined") {
  // retrieve weights
  var weights = context.getVariable(properties.weights);
  weights = JSON.parse(weights);
  if (weights.values){
    selectTarget(weights.values);
  }
}
