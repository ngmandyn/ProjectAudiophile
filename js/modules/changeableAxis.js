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
    d3.selectAll('circle')
      .transition().duration(200)
      .attr('cy', function(d) { return yscale(d[value]); });
  }    
}