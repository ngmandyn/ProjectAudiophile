// var df = require('./modules/dataFunctions.js');
var url = "https://www.sfu.ca/~ngmandyn/iat355/HeadphonesCleaned.csv";
var dimensions = ['Impedance', 'Efficiency', 'MSRP'];
var dimensionsWithStrings = ['Manufacturer', 'Model', 'Type', 'Form factor', 'Amp required']
var dataUrl = '';
var width = window.innerWidth;
var height = window.innerHeight*.70;
var margin = 42;

// create the svg
var svg = d3.select('.canvas')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// console.log(df.stripUnit('1 cm'));
d3.csv(url, prepData, function(data) {
  console.log('here is data: ');
  console.log(data);

  var colourScale = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain(d3.extent(data, function(d) { return d['Form factor'] }));

  var impedanceMin = getMin(data, 'Impedance');
  var impedanceMax = getMax(data, 'Impedance');
  console.log(impedanceMin + '; ' + impedanceMax);
  var yscale = d3.scaleLinear()
                .domain([impedanceMin, impedanceMax])
                .range([height-margin, margin]);
  var yaxis = d3.axisLeft(yscale);

  var priceMin = getMin(data, 'MSRP');
  var priceMax = getMax(data, 'MSRP');
  console.log(priceMin + '; ' + priceMax + ' USD');
  var xscale = d3.scaleLinear()
                .domain([priceMin, priceMax])
                .range([margin, width-margin]);
  var xaxis = d3.axisBottom(xscale);

  // adding axis labels
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,'+(height-margin+10)+')')
    .call(xaxis);

  svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate('+(margin-10)+', 0)')
      .call(yaxis);

  var circles = svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d) { return xscale(d['MSRP']); })
    .attr('cy', function(d) { return yscale(d['Impedance']); })
    .attr('r', '5')
    .attr('fill', function(d) { return colourScale(d['Form factor']); })
});


// replaces row(function(d))
// strips units from given dimensions
function prepData(data) {
  stripUnitsForColumns(data, dimensions);
  trimWhitespace(data, dimensionsWithStrings);
  return data;
}

// sets custom scale from input columnName
// function setXScale()