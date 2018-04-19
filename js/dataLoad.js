var dataUrl = "https://www.sfu.ca/~ngmandyn/iat355/HeadphonesCleaned.csv";
var dataUrl2 = "https://www.sfu.ca/~ngmandyn/iat355/Headphones2Cleaned.csv";

var data2 = null;
var data1 = null;
var newData = null;

var dataCount = null;

var numPerBucket = null;
var numBuckets = 15;
var sensitivityBuckets = {};

var dataFilterNames = [];
var brushableValues = [];
var margin = 56,
    width = window.innerWidth - (margin + (16*13)),
    height = (window.innerHeight-170)/2;

var dimensionsObj = {
  'Impedance': {
    units: 'ohms',
    displayName: 'impedance',
    domain: [], // initialized in initData()
    absDomain: [],
    definition: 'Impedance, measured in ohms (Ω), tells you how hard a headphone’s driver hinders the flow of electrical current '+
                'in the voice coil. This must be overcome by the power output of an amplifier, otherwise insufficient volume ' +
                'and clipping dynamic peaks will occur.',
  },
  'MSRP': {
    units: '$USD',
    displayName: 'price',
    domain: [],
    absDomain: [],
    definition: 'The manufacturer\'s suggested retail price (MSRP), in US dollars.',
  },
  'Convert to Efficiency': {
    units: 'dB/mW',
    displayName: 'efficiency',
    domain: [],
    absDomain: [],
    definition: 'Efficiency tells you how much sound pressure (volume) comes out from some about of power (milliwatts). '+
                'The lower the efficiency rating of a headphone, the harder it is to power.',
  },
  'Weight': {
    units: 'grams',
    displayName: 'weight',
    domain: [],
    absDomain: [],
    definition: 'The weight of the headphone in grams, including the cable.',
  }
}
var dimensionsWithStringsObj = {
  'Manufacturer': {
    displayName: 'brand',
    scaleOrdinal: d3.schemeCategory20,
  },
  'Model': {
    displayName: 'model',
  },
  'Form factor': {
    displayName: 'form factor',
    domain: ['Closed', 'Semi', 'Open'],
    scaleOrdinal: d3.schemeCategory10,
    definition: 'Open models offer next to no isolation and will leak noise into your surroundings, '+
                'but they achieve the best sound, stage and imaging. '+'<br/>'+
                'Closed models do not leak sound but most find them too bulky and heavy to be used portably.',
  },
  'Amp required': {
    displayName: 'amp required',
    domain: ['No', 'Maybe', 'Recommended', 'Yes'],
    scaleOrdinal: ["#b3cde3", "#8c96c6", "#8856a7", "#4d004b"],
    definition: '32 Ohm and 99dB/mW or more: You don’t need an amplifier. '+'<br/>'+
                '33-80 Ohm and 99dB/mW or more: You may benefit in getting an amplifier.' +'<br/>'+
                '33-80 Ohm and less than 99dB/mW: You should get a competent amplifier.' +'<br/>'+
                '81-300 Ohm, or more: You should definitely get a competent amplifier.',
  },
  'Bass': {
    displayName: 'bass',
    domain: ['Recessed', 'Neutral', 'Emphasized'],
    definition: 'Frequencies in the range of 0Hz-256Hz are the very low notes that make your head vibrate and your room shake '+
                '(commonly referred to as “the Wub Wub”).',
  },
  'Midrange': {
    displayName: 'midrange',
    domain: ['Recessed', 'Neutral', 'Emphasized'],
    definition: 'Frequencies between 250Hz and 2000Hz are very important for a natural presentation of sound. '+
                'Human voices fall within this range and headphones with an unnatural midrange may make vocals sound “distant”.',
  },
  'Treble': {
    displayName: 'treble',
    domain: ['Recessed', 'Neutral', 'Emphasized'],
    definition: 'The highest tones in the frequency range start at 2KHz and end at the hearing limit of the human ear at 20KHz. '+
                'Treble is what gives a headphone detail and clarity.',
  },
  'Removable Cable': {
    displayName: 'removable cable',
    domain: ['No', 'Yes'],
    definition: 'Some headphones have detachable cables that can be easily replaced. Otherwise fixing broken cables '+
                'is only possible by soldering or by using the necessary equipment.',
  },
  'Pads': {
    displayName: 'pads',
    domain: ['Velour', 'Fabric', 'Pleather', 'Leather'],
    definition: 'The headphone\'s default earpad material.',
  },
  'Image': {
    displayName: 'image',
  },
}


var dimensions = Object.keys(dimensionsObj),
    dimensionsWithStrings = Object.keys(dimensionsWithStringsObj);

// TODO: clean this up, make one object as filterSelection
// that contains all the filtered domains and ranges;
// basically makes a new object with all the selected values
var filterCollection

// position vectors, and dimensions
var xAxisOffset = { x: 0, y: height-margin+10 },
    xLabelOffset = { x: margin*2, y: 42 },
    xLabelUnitsOffset = { x: xLabelOffset.x+124, y: xLabelOffset.y },
    yAxisOffset = { x: margin*2-10, y: 0 },
    yLabelOffset = { x: 0, y: 24 },
    yLabelUnitsOffset = { x: yLabelOffset.x, y: yLabelOffset.y+16 },
    canvasDimensions = { width: width, height: height },
    legendDimensions = { width: width, height: 50 };

// the config of the starting graph's axes and colour
var dataInitConfig = {
  xAxis: {
    dimension: 'Impedance',
    displayName: 'impedance',
    units: 'ohms',
    min: null,
    max: null,
  },
  yAxis: {
    dimension: 'MSRP',
    displayName: 'price',
    units: '$USD',
    min: null,
    max: null,
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
  },
  circles: {
    minR: 5,
    maxR: 10,
  }
}

var hiddenBrands = [];
var initBrandCounts = {};

// $(window).on('resize', function() {
//   var newWidth = window.innerWidth - margin;
//   console.log(newWidth);
//   visGraphInit.canvas.svg.attr('width', newWidth);
//   visGraphInit.scales.x.range([margin*2, newWidth]);
// })


// ----------------------------------------------------------------------

// d3.queue()
//   .defer(d3.csv, dataUrl)
//   .defer(d3.csv, dataUrl2)
//   .await(combineData(data1, data2));

var queue = d3.queue();
  queue.defer(loadData1)
  queue.defer(loadData2)
  queue.defer(performTasks)
  queue.await(function(error) {
  if (error) throw error;
    console.log("done!");
  });

function loadData1(callback) {
  d3.csv(dataUrl, prepData, function(data) {
    data1 = data;
    callback(null, data1)
  });
}


function loadData2(callback) {
  d3.csv(dataUrl2)
    .row(function(d) { return d; })
    .get(function(error, rows) {
      data2 = rows;
      console.log(data1)
      console.log(data2)
      newData = combineData(data1, data2);
      console.log(newData);
      callback(null, newData)
    });
}


function combineData(data, data2) {
  var result = join(data, data2, "Model", "Model", function(data, data2) {
    return {
      Manufacturer: data.Manufacturer,
      MSRP: data2.MSRP,
      Model: data.Model,
      Pads: data.Pads,
      Impedance: data2.Impedance,
      Weight: data2.Weight,
      "Convert to Efficiency": data2['Convert to Efficiency'],
      "Form factor": data2['Form factor'],
      "Amp required": data2['Amp required'],
      Bass: data.Bass,
      Midrange: data.Midrange,
      Treble: data.Treble,
      "Removable Cable": data['Removable Cable'],
      "Image": data2['Image'],
    };
  });
  return result;
}

function performTasks(callback) {

  d3.csv(dataUrl, prepData, function(data) {

    data = newData;

    initData(data);

    // must be called after data is initialized to get domains
    initFilterCollection();
    initVis(data);

    // adding axis labels
    visGraphInit.canvas.svg.append('g')
        .attr('class', 'axis xaxis')
        .attr('id', 'data-axis-'+dataInitConfig.xAxis.dimension.toLowerCase())
        .attr('transform', 'translate('+xAxisOffset.x+','+xAxisOffset.y+')')
        .call(visGraphInit.axis.x)
    d3.select('.xaxis') // add x-axis unit label
      .append('text')
        .attr('class', 'axis__label-unit')
        .attr('text-anchor', 'start')
        .attr('x', xLabelUnitsOffset.x)
        .attr('y', xLabelUnitsOffset.y)
        .text(dataInitConfig.xAxis.units);
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
        .text(dataInitConfig.yAxis.units);

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
          if (dimension === 'Model' || dimension === 'Manufacturer' ||
              dimension === 'Form factor' || dimension === 'Amp required') {
            if (!(brushableValues.includes(d[dimension].replace(/ /g,'-').toLowerCase()))) {
              brushableValues.push(d[dimension].replace(/ /g,'-').toLowerCase());
            };
          }
          thisCircle.attr('data-'+dataAttr, d[dimension].replace(/ /g,'-').toLowerCase());
        }

      })
      .on('mouseover', function(d) {
        d3.select(this)
          .transition().duration(200)
          .attr('r', visGraphInit.circles.maxR);
          // move to front
          this.parentNode.appendChild(this);

        // don't create another tooltip if we're already hovering
        // or we have clicked this circle before
        // if (!tooltipAlreadyExists(d))
          showTooltip(d, $(this), 'large')
      })
      .on('mouseout', function(d) {

        if(!$(this).hasClass('extraSpecial')) {
          d3.select(this)
            .transition().duration(300)
            .attr('r', visGraphInit.circles.minR);
        }

        removeTooltip(d, 'large')
      })
      .on('click', function(d) {
        // toggleTooltip(d, $(this), 'large')
        favsChangeAndUpdate(d, $(this))
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
    d3.select('.jsChangeableXAxis').on('change', function() {
      updateXAxis(data, $(this).val(), visGraphInit.scales.x, visGraphInit.axis.x);
    });
    d3.select('.jsChangeableColour').on('change', function() {
      updateColours(data, $(this).val());
    });


    initSidebar(data);

    initSensitivityBuckets(data);

    sliderChangeAndUpdate();
    checkboxChangeAndUpdate();

    brushWithSearch();
    brushWithLegend();

    callback(null, newData)
  });

}


// replaces row(function(d))
// strips units from given dimensions
function prepData(data) {
  stripUnitsForColumns(data, dimensions);
  trimWhitespace(data, dimensionsWithStrings);
  return data;
}

// initialize variables in one place to keep it clean
function initData(data) {
  dataCount = d3.selectAll(data).size();

  // init object for quantitative dimensions
  // get the min and max
  for (var dimension in dimensionsObj) {
    var min = getMin(data, dimension);
    var max = getMax(data, dimension);
    dimensionsObj[dimension].domain = [min, max];
    dimensionsObj[dimension].absDomain = [min, max];

    if (dimension === dataInitConfig.xAxis.dimension) {
      dataInitConfig.xAxis.min = min;
      dataInitConfig.xAxis.max = max;
    }

    if (dimension === dataInitConfig.yAxis.dimension) {
      dataInitConfig.yAxis.min = min;
      dataInitConfig.yAxis.max = max;
    }
  }

  allBrands = d3.set( data.map(function(d) { return d[dataInitConfig.colour.dimension]; }) ).values()

  for (var i = 0; i < allBrands.length; i++) {
    initBrandCounts[allBrands[i]] = {};
    initBrandCounts[allBrands[i]]['count'] = getCountOfDomainElement(data, 'Manufacturer', allBrands[i])
  }

  // console.log(initBrandCounts)

  brandCounts = {}
  for (var i = 0; i < allBrands.length; i++) {
    brandCounts[allBrands[i]] = {};
    brandCounts[allBrands[i]]['count'] = getCountOfDomainElement(data, 'Manufacturer', allBrands[i])
  }

  // console.log(allBrands)
  // console.log(brandCounts)

}

// initialize basic properties for the visualization
// such as the scales and axes
function initVis(data) {

  // create the svg
  visGraphInit.canvas.svg = d3.select('.canvas')
    .append('svg')
      .attr('width', canvasDimensions.width)
      .attr('height', canvasDimensions.height)

  // create the dropshadow filter
  visGraphInit.canvas.svg.append('defs')
    .append('filter')
      .attr('id', 'dropshadow')
      .attr('y', '-60%')
      .attr('x', '-60%')
      .attr('width', '240%')
      .attr('height', '240%')
      .attr('in', 'SourceGraphic')
    .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '3')
      .attr('flood-color', '#B27FE7')
      .attr('flood-opacity', '1')

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
    .scale(visGraphInit.scales.colour)
    .orient('horizontal');
  visGraphInit.legend.svg.select('.legendOrdinal').call(legendOrdinal);
}

// adds in the checkboxes for all the defined dimensions
function initSidebar(data) {

  // init qualitative dimensions as checkboxes
  for (var dimension in dimensionsWithStringsObj) {
    var thisDomain = dimensionsWithStringsObj[dimension].domain;

    if (typeof(thisDomain) !== 'undefined') {
      var $accordionTemplate = $($('#template-accordion').html());
      // appends title of the dimension
      var elemName = dimensionsWithStringsObj[dimension].displayName.replace(/ /g,'-');
      var $title = $($('#template-dimension-title').html());

      var $tooltipTemplate = $($('#template-info-tooltip').html());
      var definition = dimensionsWithStringsObj[dimension].definition
      $title.html(dimension.toLowerCase()).append($tooltipTemplate);
      $tooltipTemplate.closest('.jsTooltipInfoInsert').html(definition)

      if (dimension === 'Bass' || dimension === 'Midrange' || dimension === 'Treble') {
        $('[data-filter-section='+elemName+']').append($title);
      }
      else {
        $('[data-filter-section='+elemName+']').append($accordionTemplate);
        $('[data-filter-section='+elemName+'] .accordion__title').append($title);
      }

      // appends each entry of the dimension
      for (var i = 0; i < thisDomain.length; i++) {
        var elem = thisDomain[i];
        var domainCount = getCountOfDomainElement(data, dimension, elem);
        var sensitivityBarWidth = (domainCount/dataCount*100)+'%';

        var $newCheckbox = $($('#template-checkbox').html());
        $newCheckbox.find('input')
          .attr('data-filter-'+elemName, elem)
          .prop('checked',true);
        $newCheckbox.find('.sensitivity-button__hbar').css('width', sensitivityBarWidth);
        $newCheckbox.find('.jsLabelInput').html(elem);

        if (dimension === 'Bass' || dimension === 'Midrange' || dimension === 'Treble')
          $('[data-filter-section='+elemName+']').append($newCheckbox);
        else
          $('[data-filter-section='+elemName+'] [data-tab-content]').append($newCheckbox);
      }
    }
  }


  // init quantitative dimensions as sliders
  for (var dimension in dimensionsObj) {
    var thisDomain = dimensionsObj[dimension].domain;

    if (typeof(thisDomain) !== 'undefined') {
      var elemName = dimensionsObj[dimension].displayName.replace(/ /g,'-');
      var $title = $($('#template-dimension-title').html());
      var units = dimensionsObj[dimension].units
      var $unitsTemplate = $($('#template-dimension-units').html());
      var $tooltipTemplate = $($('#template-info-tooltip').html());
      var definition = dimensionsObj[dimension].definition

      $unitsTemplate.closest('.dimension-units').html(units)
      $title.html(elemName).append($unitsTemplate).append($tooltipTemplate);
      $tooltipTemplate.closest('.jsTooltipInfoInsert').html(definition)

      var $newSlider = $($('#template-slider').html());
      $newSlider.attr({
        'data-start': thisDomain[0],
        'data-initial-start': thisDomain[0],
        'data-end': thisDomain[1],
        'data-initial-end': thisDomain[1],
      })

      console.log($newSlider.find('.slider-handle'));

      $newSlider.find('.slider-handle').each(function(i) {
        $(this).attr('aria-controls','sliderOutput'+i+'-'+elemName)
      })
      $newSlider.filter('input[type=number]').each(function(i) {
        $(this).attr('id', 'sliderOutput'+i+'-'+elemName)
      })
      
      if (dimension === 'MSRP') {
        $('[data-filter-section='+elemName+']').append($title).append($newSlider);
      }
      else {
        var $accordionTemplate = $($('#template-accordion').html());
        $('[data-filter-section='+elemName+']').append($accordionTemplate);
        $('[data-filter-section='+elemName+'] .accordion__title').append($title)
        $('[data-filter-section='+elemName+'] [data-tab-content]').append($newSlider);
        // $('[data-filter-section='+elemName+']').append($title).append($newSlider);
        
        // console.log($newSlider.filter('.slider'));
        // var slider = new Foundation.Slider($newSlider.filter('.slider'));
      }
    }
  }

  $('.jsToggleTooltip').on('mouseover', function(d) {
    // $(this).siblings('.info-tooltip-definition').css('display','inline-block');
    $(this).siblings('.info-tooltip-definition').delay(400).fadeIn(100);
  })
  .on('mouseout', function(d) {
    // $(this).siblings('.info-tooltip-definition').css('display','none');
    $(this).siblings('.info-tooltip-definition').fadeOut(50);
  });

  // var $sliders = $('.slider')
  // var sliders = new Foundation.Slider($sliders);
  // $('.sidebar').foundation(); // initializes the sliders with foundation
  $(document).foundation();
  // console.log($('.accordion'))
  var accordion = new Foundation.Accordion($('.accordion'));
  $('.accordion__title').on('click', function(ev) {
    ev.preventDefault();
    var $thisParent = $(this).closest('.accordion');
    console.log($thisParent)
    var $thisItem = $(this).parents('[data-accordion-item]');
    var $thisContent = $thisItem.find('[data-tab-content]')

    $thisParent.foundation('toggle', $thisContent);
  });

}
