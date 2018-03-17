function updateYAxis(data, value, yscale, yaxis) {
  if (typeof(value) !== "undefined") {
    // var value = $(this).val(); //get select box's value
    var outputValue = dimensionsObj[value].displayName;
    var units = dimensionsObj[value].units;
    var newMin = dimensionsObj[value].domain[0];
    var newMax = dimensionsObj[value].domain[1];

    yscale.domain([newMin, newMax]);
    yaxis.scale(yscale);
    d3.select('.yaxis')
      .call(yaxis);
    d3.select('.axis__label--y').text(outputValue.toLowerCase());
    d3.select('.yaxis .axis__label-unit').text(units);
    updateAxisDimensionId('y', value.replace(/ /g, '-').toLowerCase())
    updatePointPositions('y', yscale, value);
  }
}


function updateAxisDomain(axis, d3Axis, d3Scale, newDomain, dimension) {
  d3Scale.domain(newDomain)
  d3Axis.scale(d3Scale)
  d3.select('.'+axis+'axis').call(d3Axis)

  // updateAxisDimensionId(axis, dimension)
  // d3.select('.axis').classed(dimension, true).classed(oldDimension, false)
  updatePointPositions(axis, d3Scale, dimension);
}

function updatePointPositions(axis, d3Scale, dimension) {
  d3.selectAll('circle')
    .transition().duration(200)
    .attr('c'+axis, function(d) { return d3Scale(d[dimension]); });
}

function updateAxisDimensionId(axis, newDimension) {
  var newClass = 'data-axis-'+newDimension
  d3.select('.'+axis+'axis').attr('id', newClass)
}