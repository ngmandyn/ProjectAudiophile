function updateColours(data, value) {
  if (typeof(value) !== "undefined") {

    var legendVals = d3.set(data.map( function(d) { return d[value] } ) ).values();

    if (value === 'Form factor') {
      var colourScale = d3.scaleOrdinal(d3.schemeCategory10)
                          .domain(['Closed', 'Semi', 'Open'])
    } else if (value === 'Amp required') {
      colourScale = d3.scaleOrdinal(d3.schemeCategory20b)
                      .domain(['No', 'Maybe', 'Recommended', 'Yes'])
    } else if (value === 'Manufacturer') {
      colourScale = d3.scaleOrdinal(d3.schemeCategory20)
                      .domain(legendVals);
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