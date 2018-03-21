function updateXAxis(data, value, xscale, xaxis) {
  if (typeof(value) !== "undefined") {
    // var value = $(this).val(); //get select box's value
    var outputValue = dimensionsObj[value].displayName;
    var units = dimensionsObj[value].units;
    // use the filter's value, to see if values have been changed
    var newMin = filterCollection[value].domain[0];
    var newMax = filterCollection[value].domain[1];

    xscale.domain([newMin, newMax]);
    xaxis.scale(xscale);
    d3.select('.xaxis')
      .call(xaxis);
    d3.select('.axis__label--x').text(outputValue.toLowerCase());
    d3.select('.xaxis .axis__label-unit').text(units);
    updateAxisDimensionId('x', value.replace(/ /g, '-').toLowerCase())
    updatePointPositions('x', xscale, value);
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
    .attr('c'+axis, function(d) { return d3Scale(d[dimension]); })
    .each(function(d) {
      if(tooltipAlreadyExists(d)) {
        updateTooltipPositionWithCircle(d, $(this))
      }
    });
}

function updateAxisDimensionId(axis, newDimension) {
  var newClass = 'data-axis-'+newDimension
  d3.select('.'+axis+'axis').attr('id', newClass)
}