function updateYAxis(data, value, yscale, yaxis) {
  if (typeof(value) !== "undefined") {
    // var value = $(this).val(); //get select box's value
    var outputValue = value;
    var units;
    var newMin = getMin(data, value);
    var newMax = getMax(data, value);

    if (value === 'Convert to Efficiency') {
      outputValue = 'efficiency';
      units = '[dB/mW]';
    }
    else if(value === 'Impedance')
      units = '[ohms]';
    else if(value === 'Weight')
      units = '[grams]';

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