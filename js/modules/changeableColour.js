function updateColours(data, value) {
  if (typeof(value) !== "undefined") {

    var legendVals = d3.set(data.map( function(d) { return d[value] } ) ).values();

    if (value === 'Manufacturer') {
      var colourScale = d3.scaleOrdinal(d3.schemeCategory20)
                      .domain(legendVals);
    } else {
      console.log(dimensionsWithStringsObj[value]);
      var colourScale = d3.scaleOrdinal(dimensionsWithStringsObj[value].scaleOrdinal)
                          .domain(dimensionsWithStringsObj[value].domain);
    }
      
    var legendOrdinal = d3.legendColor()
                          .shape('path', d3.symbol().type(d3.symbolCircle).size(100)())
                          .shapePadding(75)
                          .cellFilter(function(d){ return d.label !== 'e' })
                          .scale(colourScale)
                          .orient('horizontal');

    d3.select('.legendOrdinal')
      .call(legendOrdinal);

    d3.selectAll('circle')
      .transition().duration(200)
      .attr('fill', function(d) { return colourScale(d[value]); })
  }
}