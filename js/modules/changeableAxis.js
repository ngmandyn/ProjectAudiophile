function updateYAxis(data, value, yscale, yaxis) {
  if (typeof(value) !== "undefined") {
    // var value = $(this).val(); //get select box's value
  
    var newMin = getMin(data, value);
    var newMax = getMax(data, value);
    console.log(value);
    console.log('newMin/Max: ' + newMin + '; ' + newMax);

    yscale.domain([newMin, newMax]);
    yaxis.scale(yscale);
    d3.select('.yaxis')
      .call(yaxis);
    d3.selectAll('circle')
      .transition().duration(200)
      .attr('cy', function(d) { return yscale(d[value]); });
  }    
}