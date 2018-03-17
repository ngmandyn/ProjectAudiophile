var dataUrl = "https://www.sfu.ca/~ngmandyn/iat355/HeadphonesCleaned.csv";
var dataUrl2 = "https://www.sfu.ca/~ngmandyn/iat355/Headphones2Cleaned.csv";
var dimensions = ['Impedance', 'MSRP', 'Convert to Efficiency'],
    dimensionsWithStrings = ['Manufacturer', 'Model', 'Type', 'Form factor', 'Amp required'];
var dataFilterNames = [];
var dataAttributes = [];
var margin = 56,
    width = window.innerWidth - margin,
    height = window.innerHeight - 272;

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
// console.log(dimensionsObj);
// console.log(dataAttributes);

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

  initData(data);
  initVis(data);
  initSidebar();
  sliderChangeAndUpdate();

  // console.log(data);

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

  // TODO: clean this up, make one object as filterSelection
  // that contains all the filtered domains and ranges;
  // basically makes a new object with all the selected values
  var checkboxSelection = dimensionsWithStringsObj;
  delete checkboxSelection.Manufacturer
  delete checkboxSelection.Model

  $('input[type=checkbox').on('change', function() {
    handleFilterList($(this))

    // TODO: combine these conditionals with the range conditionals
    d3.selectAll('circle')
      .classed('hide', function(d) {
        var isHide = false;
        for (var dimension in checkboxSelection) {
          var currentSelected = checkboxSelection[dimension].domain
          // console.log(checkboxSelection[dimension].domain)
          console.log(d[dimension])

          if (!currentSelected.includes(d[dimension])) isHide = true;
        }
        return isHide;
      })

  });

  // adds or removed values from the selection list based on what was changed
  function handleFilterList(thisCheckbox) {
    var parentDimension = thisCheckbox.parents('section').attr('data-filter-dimension')
    var parentDimensionName = parentDimension.replace(/-/g, ' ')
    var thisValue = thisCheckbox.attr('data-filter-'+parentDimension.toLowerCase())
    var isChecked = thisCheckbox.prop('checked')

    // if the checkbox was checked, add an addition to the domain
    // if the checkbox was unchecked, remove from the list of conditions
    if (isChecked) {
      checkboxSelection[parentDimensionName].domain.push(thisValue) // add to conditions
    }
    else {
      var index = checkboxSelection[parentDimensionName].domain.indexOf(thisValue)
      checkboxSelection[parentDimensionName].domain.splice(index, 1) // add to conditions
    }
  }


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
        thisCircle.attr('data-'+dataAttr, d[dimension]);
      }
    })
    .on('mouseover', function() {
      d3.select(this)
        .transition().duration(200)
        .attr('r', 10);
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition().duration(300)
        .attr('r', 5);
    })
    .on('click', function() {
      // $(this).children('.tooltip').toggleClass('hide');
      var content = $(this).find('.tooltip-data')[0].textContent;
      console.log(content);
      // $('.tooltip').html($.parseHTML(content));
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
    // dataFilterNames.push('data-filter-'+dimensionsWithStringsObj[dimension].displayName.replace(/ /g,'-').toLowerCase());
    // dataAttributes.push('data-'+dimension.replace(/ /g,'-').toLowerCase());
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
          // .attr('')
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

function sliderChangeAndUpdate() {
  $('[data-slider]').on('moved.zf.slider', function() {
    var adjustingDimension = $(this).parents('[data-filter-section]').attr('data-filter-dimension')
    var dimensionName = adjustingDimension.replace(/-/g, ' ')
    var dimensionDisplayName = adjustingDimension.replace(/ /g, '-').toLowerCase()
    var newMin = $(this).find('input.js-slider-min').val()
    var newMax = $(this).find('input.js-slider-max').val()
    var newDomain = [newMin, newMax]

    // hide points that don't fit new domain
    d3.selectAll('circle')
      .classed('hide', function(d) {
        return newMin >= d[dimensionName] || d[dimensionName] >= newMax
      })

    var $adjustingAxis = $('#data-axis-'+dimensionDisplayName)
    // console.log('#data-axis-'+dimensionDisplayName);
    // console.log(dimensionName)

    // check if this axis is actively being shown,
    // so that we know to update the x or y axis
    if ($adjustingAxis.length > 0) {
      // if this adjusting axis is the xaxis
      if($adjustingAxis.hasClass('xaxis')) {
        updateAxisDomain('x', visGraphInit.axis.x, visGraphInit.scales.x, newDomain, dimensionName)
      }
      // else we are adjusting the yaxis 
      else if ($adjustingAxis.hasClass('yaxis')) {
        updateAxisDomain('y', visGraphInit.axis.y, visGraphInit.scales.y, newDomain, dimensionName)
      }
    }
  });
}