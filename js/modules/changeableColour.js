function updateColours(data, value) {
  if (typeof(value) !== "undefined") {
    var colourScale = d3.scaleOrdinal(d3.schemeCategory10)
                        .domain(d3.extent(data, function(d) { return d[value] }));
    console.log(value);

    d3.selectAll('circle')
      .transition().duration(200)
      .attr('fill', function(d) { return colourScale(d[value]); })
  }
}