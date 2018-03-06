// var df = require('./modules/dataFunctions.js');
var url = "https://www.sfu.ca/~ngmandyn/iat355/HeadphonesCleaned.csv";
var dimensions = ['Impedance', 'MSRP', 'Convert to Efficiency'];
var dimensionsWithStrings = ['Manufacturer', 'Model', 'Type', 'Form factor', 'Amp required']
var dataUrl = '';
var width = window.innerWidth;
var height = window.innerHeight*.75;
var margin = 56;

// create the svg
var svg = d3.select('.canvas')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// console.log(df.stripUnit('1 cm'));
d3.csv(url, prepData, function(data) {
  console.log('here is data: ');
  console.log(data);

  var legendVals = d3.set(data.map( function(d) { return d['Manufacturer']} ) ).values();

  console.log(legendVals);

  var colourScale = d3.scaleOrdinal(d3.schemeCategory20)
                      .domain(legendVals);

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(80, 7)");

var legendOrdinal = d3.legendColor()
  .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
  .shapePadding(75)
  .cellFilter(function(d){ return d.label !== "e" })
  .scale(colourScale)
  .orient('horizontal');

svg.select(".legendOrdinal")
  .call(legendOrdinal);


  var impedanceMin = getMin(data, 'Impedance');
  var impedanceMax = getMax(data, 'Impedance')+50;
  var efficiencyMin = getMin(data, 'Convert to Efficiency');
  var efficiencyMax = getMax(data, 'Convert to Efficiency')+50;
  console.log('impedance min & max:' + impedanceMin + '; ' + impedanceMax);
  console.log('efficiency min & max:' + efficiencyMin + '; ' + efficiencyMax);
  var yscale = d3.scaleLinear()
                .domain([0, impedanceMax])
                .range([height-margin, margin]);
  var yaxis = d3.axisLeft(yscale);

  $(document).ready(function() {
    $('.jsChangeableYAxis').on('change', function() {
      updateYAxis(data, $(this).val(), yscale, yaxis);
    });
    $('.jsChangeableColour').on('change', function() {
      updateColours(data, $(this).val());
    });
  });

  var priceMin = getMin(data, 'MSRP');
  var priceMax = getMax(data, 'MSRP')+500;
  console.log(priceMin + '; ' + priceMax + ' USD');
  var xscale = d3.scaleLinear()
                .domain([0, priceMax])
                .range([margin, width-margin]);
  var xaxis = d3.axisBottom(xscale);

  // adding axis labels
  svg.append('g')
    .attr('class', 'axis xaxis')
    .attr('transform', 'translate(0,'+(height-margin+10)+')')
    .call(xaxis);

  svg.append('g')
      .attr('class', 'axis yaxis')
      .attr('transform', 'translate('+(margin-10)+', 0)')
      .call(yaxis);

  var circles = svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d) { return xscale(d['MSRP']); })
    .attr('cy', function(d) { return yscale(d['Impedance']); })
    .attr('r', '5')
    .attr('fill', function(d) { return colourScale(d['Manufacturer']); })

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
