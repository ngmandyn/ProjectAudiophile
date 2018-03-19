var dataUrl = "https://www.sfu.ca/~ngmandyn/iat355/HeadphonesCleaned.csv";
var dataUrl2 = "https://www.sfu.ca/~ngmandyn/iat355/Headphones2Cleaned.csv";
var dimensions = ['Impedance', 'MSRP', 'Convert to Efficiency', 'Weight'],
    dimensionsWithStrings = ['Manufacturer', 'Model', 'Type', 'Form factor', 'Amp required'];
var dataFilterNames = [];
var searchableValues = [];
var margin = 56,
    width = window.innerWidth - (margin + (16*13)),
    height = window.innerHeight - 298;

var dimensionsObj = {
  'Impedance': {
    units: 'ohms',
    displayName: 'impedance',
    domain: [], // initialized in initData()
  },
  'MSRP': {
    units: '$USD',
    displayName: 'price',
    domain: [],
  },
  'Convert to Efficiency': {
    units: 'dB/mW',
    displayName: 'efficiency',
    domain: [],
  },
  'Weight': {
    units: 'grams',
    displayName: 'weight',
    domain: [],
  }
}
var dimensionsWithStringsObj = {
  'Manufacturer': {
    displayName: 'brand',
    // domain: [],
    scaleOrdinal: d3.schemeCategory20,
  },
  'Model': {
    displayName: 'model',
  },
  'Form factor': {
    displayName: 'form factor',
    domain: ['Closed', 'Semi', 'Open'],
    scaleOrdinal: d3.schemeCategory10,
  },
  'Amp required': {
    displayName: 'amp required',
    domain: ['No', 'Maybe', 'Recommended', 'Yes'],
    scaleOrdinal: d3.schemeCategory20b,
  },
}

// TODO: clean this up, make one object as filterSelection
// that contains all the filtered domains and ranges;
// basically makes a new object with all the selected values
var filterCollection

// position vectors, and dimensions
var xAxisOffset = { x: 0, y: height-margin+10 },
    xLabelOffset = { x: margin*2, y: 36 },
    xLabelUnitsOffset = { x: xLabelOffset.x+42, y: xLabelOffset.y },
    yAxisOffset = { x: margin*2-10, y: 0 },
    yLabelOffset = { x: 0, y: 24 },
    yLabelUnitsOffset = { x: yLabelOffset.x, y: yLabelOffset.y+16 },
    canvasDimensions = { width: width, height: height },
    legendDimensions = { width: width, height: 50 };

// the config of the starting graph's axes and colour
var dataInitConfig = {
  xAxis: {
    dimension: 'MSRP',
    displayName: 'price',
    units: '$USD',
    min: null,
    max: null,
    // offset: 50,
  },
  yAxis: {
    dimension: 'Impedance',
    displayName: 'impedance',
    units: 'ohms',
    min: null,
    max: null,
    // offset: 50,
  },
  colour: {
    dimension: 'Manufacturer',
    displayName: 'brands',
  }
}

var visGraphInit = {
  canvas: {
    svg: null,
    // dimensions: { width: width, height: height },
  },
  legend: {
    svg: null,
    vals: null,
    // dimensions: { width: width, height: 50 },
  },
  scales: {
    x: null,
    y: null,
    colour: null,
  },
  axis: {
    x: null,
    y: null,
  }
}


// $(window).on('resize', function() {
//   var newWidth = window.innerWidth - margin;
//   console.log(newWidth);
//   visGraphInit.canvas.svg.attr('width', newWidth);
//   visGraphInit.scales.x.range([margin*2, newWidth]);
// })


// ----------------------------------------------------------------------
d3.csv(dataUrl, prepData, function(data) {

  var data2 = null;

  d3.csv(dataUrl2)
    .row(function(d) { return d; })
    .get(function(error, rows) {
      //console.log(rows);
      data2 = rows;
      combineData();
    });

  function combineData() {
    var result = join(data, data2, "Model", "Model", function(data, data2) {
      return {
        Manufacturer: data.Manufacturer,
        Model: data.Model,
        Pads: data.Pads,
        "Form factor": data2['Form factor'],
      };
    });
    data = result;
  }

  initData(data);
  // must be called after data is initialized to get domains
  initFilterCollection();
  initVis(data);
  initSidebar();

  sliderChangeAndUpdate();
  checkboxChangeAndUpdate();

  searchAndBrush();

  // adding axis labels
  visGraphInit.canvas.svg.append('g')
      .attr('class', 'axis xaxis')
      .attr('id', 'data-axis-'+dataInitConfig.xAxis.dimension.toLowerCase())
      .attr('transform', 'translate('+xAxisOffset.x+','+xAxisOffset.y+')')
      .call(visGraphInit.axis.x)
    .append('text') // x-axis label
      .attr('class', 'axis__label axis__label--x')
      .attr('text-anchor', 'start')
      .attr('x', xLabelOffset.x)
      .attr('y', xLabelOffset.y)
      .text(dataInitConfig.xAxis.displayName);
  d3.select('.xaxis') // add x-axis unit label
    .append('text')
      .attr('class', 'axis__label-unit')
      .attr('text-anchor', 'start')
      .attr('x', xLabelUnitsOffset.x)
      .attr('y', xLabelUnitsOffset.y)
      .text('['+dataInitConfig.xAxis.units+']');
  visGraphInit.canvas.svg.append('g')
      .attr('class', 'axis yaxis')
      .attr('id', 'data-axis-'+dataInitConfig.yAxis.dimension.replace(/ /, '-').toLowerCase())
      .attr('transform', 'translate('+yAxisOffset.x+','+yAxisOffset.y+')')
      .call(visGraphInit.axis.y)
    .append('text') // y-axis label
      .attr('class', 'axis__label axis__label--y')
      .attr('text-anchor', 'end')
      .attr('x', yLabelOffset.x)
      .attr('y', yLabelOffset.y)
      .text(dataInitConfig.yAxis.displayName)
  d3.select('.yaxis') // add y-axis unit label
      .append('text')
      .attr('class', 'axis__label-unit')
      .attr('text-anchor', 'end')
      .attr('x', yLabelUnitsOffset.x)
      .attr('y', yLabelUnitsOffset.y)
      .text('['+dataInitConfig.yAxis.units+']');

  // drawing circles
  var circles = visGraphInit.canvas.svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d) { return visGraphInit.scales.x(d[dataInitConfig.xAxis.dimension]); })
    .attr('cy', function(d) { return visGraphInit.scales.y(d[dataInitConfig.yAxis.dimension]); })
    .attr('r', '5')
    .attr('fill', function(d) { return visGraphInit.scales.colour(d[dataInitConfig.colour.dimension]); })
    .each(function(d) {
      // appends data attributes for quantitative dimensions for filtering later
      var thisCircle = d3.select(this);
      for (var dimension in dimensionsWithStringsObj) {
        var dataAttr = dimension.replace(/ /g,'-').toLowerCase();
        if (dimension === 'Model' || dimension === 'Manufacturer') {
          if (!(searchableValues.includes(d[dimension].replace(/ /g,'-').toLowerCase()))) {
            searchableValues.push(d[dimension].replace(/ /g,'-').toLowerCase());
          };
        }
        thisCircle.attr('data-'+dataAttr, d[dimension].replace(/ /g,'-').toLowerCase());
      }
    })
    .on('mouseover', function(d) {
      d3.select(this)
        .transition().duration(200)
        .attr('r', 10);
        // move to front
        this.parentNode.appendChild(this);

      // don't create another tooltip if we're already hovering
      // or we have clicked this circle before
      if (!tooltipAlreadyExists(d))
        showTooltip(d, $(this))
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition().duration(300)
        .attr('r', 5);

      removeTooltip(d, 'small')
    })
    .on('click', function(d) {
      // showTooltip(d, $(this))
      // removeTooltip(d, 'small')
      toggleTooltip(d, $(this), 'large')
    })
    .append('p')
      .attr('class', 'tooltip-data')
      .text(function(d) {
        var string = '';
        dimensionsWithStrings.forEach(function(value, i) {
          string += value + ': ' + d[value] + ' \n';
        });
        return string;
      });

  // interaction event listeners for y axis and colour
  d3.select('.jsChangeableYAxis').on('change', function() {
    updateYAxis(data, $(this).val(), visGraphInit.scales.y, visGraphInit.axis.y);
  });
  d3.select('.jsChangeableColour').on('change', function() {
    updateColours(data, $(this).val());
  });


});



// replaces row(function(d))
// strips units from given dimensions
function prepData(data) {
  stripUnitsForColumns(data, dimensions);
  trimWhitespace(data, dimensionsWithStrings);
  return data;
}

// initialize variables in one place to keep it clean
function initData(data) {
  // dataInitConfig.forEach(function(elem) {
  // init object instantiate --> change to use overall obj in the end
  for (var elem in dataInitConfig) {
    var min = getMin(data, dataInitConfig[elem]['dimension']);
    var max = getMax(data, dataInitConfig[elem]['dimension']);
    dataInitConfig[elem]['min'] = min;
    dataInitConfig[elem]['max'] = max;
  }

  // init object for quantitative dimensions
  for (var dimension in dimensionsObj) {
    var min = getMin(data, dimension);
    var max = getMax(data, dimension);
    dimensionsObj[dimension].domain = [min, max];
  }
  // console.log(dimensionsObj);
}

// initialize basic properties for the visualization
// such as the scales and axes
function initVis(data) {
  // create the svg
  visGraphInit.canvas.svg = d3.select('.canvas')
    .append('svg')
    .attr('width', canvasDimensions.width)
    .attr('height', canvasDimensions.height);

  // initialize scales and axis for x and y
  visGraphInit.scales.y = d3.scaleLinear()
                .domain([0, dataInitConfig.yAxis.max])
                .range([height-margin, margin]);
  visGraphInit.scales.x = d3.scaleLinear()
                .domain([0, dataInitConfig.xAxis.max])
                .range([margin*2, width-margin]);

  visGraphInit.axis.y = d3.axisLeft(visGraphInit.scales.y);
  visGraphInit.axis.x = d3.axisBottom(visGraphInit.scales.x);

  // create the legend svg
  visGraphInit.legend.svg = d3.select('.legend-display')
    .append('svg')
    .attr('width', legendDimensions.width)
    .attr('height', legendDimensions.height);
  visGraphInit.legend.svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(56, 7)");

  // initialize the colour scale
  visGraphInit.legend.vals = d3.set( data.map(function(d) { return d[dataInitConfig.colour.dimension]; }) ).values();
  visGraphInit.scales.colour = d3.scaleOrdinal(d3.schemeCategory20)
                      .domain(visGraphInit.legend.vals);
  legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
    .shapePadding(75)
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(visGraphInit.scales.colour)
    .orient('horizontal');
  visGraphInit.legend.svg.select(".legendOrdinal").call(legendOrdinal);
}

// adds in the checkboxes for all the defined dimensions
function initSidebar() {

  // init qualitative dimensions as checkboxes
  for (var dimension in dimensionsWithStringsObj) {
    var thisDomain = dimensionsWithStringsObj[dimension].domain;
    if (typeof(thisDomain) !== 'undefined') {
      // appends title of the dimension
      var elemName = dimensionsWithStringsObj[dimension].displayName.replace(/ /g,'-').toLowerCase();
      var $title = $($('#template-dimension-title').html());
      $('[data-filter-section='+elemName+']').append($title.html(dimension));

      for (var i = 0; i < thisDomain.length; i++) {
        // appends each entry of the dimension
        var elem = thisDomain[i];
        var $newCheckbox = $($('#template-checkbox').html());
        $newCheckbox.find('input')
          .attr('data-filter-'+elemName, elem)
          .prop('checked',true);
        $newCheckbox.find('.jsLabelInput').html(elem);
        $('[data-filter-section='+elemName+']').append($newCheckbox);
      }
    }
  }

  // init quantitative dimensions as sliders
  for (var dimension in dimensionsObj) {
    var thisDomain = dimensionsObj[dimension].domain;

    if (typeof(thisDomain) !== 'undefined') {
      var elemName = dimensionsObj[dimension].displayName.replace(/ /g,'-').toLowerCase();
      var $title = $($('#template-dimension-title').html());
      $('[data-filter-section='+elemName+']').append($title.html(dimensionsObj[dimension].displayName));

      var $newSlider = $($('#template-slider').html());
      $newSlider.attr({
        'data-start': thisDomain[0],
        'data-initial-start': thisDomain[0],
        'data-end': thisDomain[thisDomain.length -1],
        'data-initial-end': thisDomain[thisDomain.length -1],
      })

      $newSlider.find('.slider-handle').each(function(i) {
        $(this).attr('aria-controls','sliderOutput'+i+'-'+elemName)
      })
      $newSlider.find('input[type=text]').each(function(i) {
        $(this).attr('id', 'sliderOutput'+i+'-'+elemName)
      })

      $('[data-filter-section='+elemName+']').append($newSlider);
    }
  }
  // var sliders = new Foundation.Slider($('.slider'))
  
  $(document).foundation(); // initializes the sliders with foundation
}
