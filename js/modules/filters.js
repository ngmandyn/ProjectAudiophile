// combines the dimensions together into one object of all selected filters
// and removes the dimensions that are not filterable.
// TODO: update Manufacturer
function initFilterCollection() {
  filterCollection = {...dimensionsObj, ...dimensionsWithStringsObj}
  delete filterCollection.Manufacturer
  delete filterCollection.Model
  delete filterCollection.Image
}

function initSensitivityBuckets (data) {
  numPerBucket = Math.round(dataCount/numBuckets);
  var priceRangeMin = dimensionsObj.MSRP.domain[0] - 1;
  var priceRangeMax = dimensionsObj.MSRP.domain[1];
  var priceRangePerBucket = (priceRangeMax-priceRangeMin)/numBuckets;

  // creates the buckets, with the domain min and max
  for (var i = 0; i < numBuckets; i++) {
    var bucketMin = priceRangeMin + (priceRangePerBucket*i) + 1;
    var bucketMax = bucketMin + priceRangePerBucket;
    sensitivityBuckets[i] = {};
    sensitivityBuckets[i]['domain'] = [bucketMin, bucketMax];
    sensitivityBuckets[i]['maxCount'] = 0;
    sensitivityBuckets[i]['count'] = 0;
  }

  // loops through data entries to count how many are in each bucket
  d3.map(data, function(d) {
    var itemPrice = d['MSRP'];

    for (bucket in sensitivityBuckets) {
      var bucketMin = sensitivityBuckets[bucket]['domain'][0];
      var bucketMax = sensitivityBuckets[bucket]['domain'][1];
      if (itemPrice >= bucketMin && itemPrice < bucketMax) {
        sensitivityBuckets[bucket]['maxCount']++;
        sensitivityBuckets[bucket]['count']++;
      }
    }
  });

  initSensitivityHistogram();
  // and updates the histogram
  redrawSensitivityHistogram();
}

// adds or removed values from the selection list based on what was changed
function handleCheckboxFilterList(thisCheckbox) {
  var parentDimension = thisCheckbox.parents('section').attr('data-filter-dimension')
  var parentDimensionName = parentDimension.replace(/-/g, ' ')
  var thisValue = thisCheckbox.attr('data-filter-'+parentDimension.toLowerCase().replace(/ /g, '-'))
  var isChecked = thisCheckbox.prop('checked')
  // if the checkbox was checked, add an addition to the domain
  // if the checkbox was unchecked, remove from the list of conditions
  if (isChecked) {
    filterCollection[parentDimensionName].domain.push(thisValue) // add to conditions
  }
  else {
    var index = filterCollection[parentDimensionName].domain.indexOf(thisValue)
    filterCollection[parentDimensionName].domain.splice(index, 1) // add to conditions
  }
}

function checkboxChangeAndUpdate() {
  $('input[type=checkbox').on('change', function() {
    handleCheckboxFilterList($(this))
    resetSensitivityBuckets();
    checkCircleAgainstAllFilters();
    redrawSensitivityHistogram();
  });
}

function sliderChangeAndUpdate() {
  $('[data-slider]').on('moved.zf.slider', function() {

    var adjustingDimension = $(this).parents('[data-filter-section]').attr('data-filter-dimension')
    var dimensionName = adjustingDimension.replace(/-/g, ' ')
    var dimensionDisplayName = adjustingDimension.replace(/ /g, '-').toLowerCase()
    // TODO: make a function for this?
    // be careful to parseInt values, as they are usually returned as strings
    var newMin = parseInt($(this).siblings('input.js-slider-min').val())
    var newMax = parseInt($(this).siblings('input.js-slider-max').val())
    var newDomain = [newMin, newMax]
    filterCollection[dimensionName].domain = newDomain

    // hide points that don't fit new domain
    resetSensitivityBuckets();
    checkCircleAgainstAllFilters();
    redrawSensitivityHistogram();

    var $adjustingAxis = $('#data-axis-'+dimensionDisplayName)

    // check if this axis is actively being shown,
    // so that we know to update the x or y axis
    if ($adjustingAxis.length > 0) {
      // if this adjusting axis is the xaxis
      if($adjustingAxis.hasClass('xaxis')) {
        console.log(visGraphInit.scales)
        updateAxisDomain('x', visGraphInit.axis.x, visGraphInit.scales.x, newDomain, dimensionName)
      }
      // else we are adjusting the yaxis
      else if ($adjustingAxis.hasClass('yaxis')) {
        console.log(visGraphInit.scales)
        updateAxisDomain('y', visGraphInit.axis.y, visGraphInit.scales.y, newDomain, dimensionName)
      }
    }
  });
}

// checks each circle against all the filters,
// so that only circles matching every criteria are shown
function checkCircleAgainstAllFilters() {
  d3.selectAll('circle')
    .classed('hide', function(d) {
      var isHide = false;
      for (var dimension in filterCollection) {
        var checkingDomain = filterCollection[dimension].domain
        // once one dimension doesn't match the selection, we hide it
        if (typeof(checkingDomain[0]) === 'number' && isOutsideNumberDomain(d, dimension)) {
          return true;
        } else if (typeof(checkingDomain[0]) === 'string' && isOutsideStringDomain(d, dimension)) {
          return true;
        }
      }
      updateSensitivityCount(d, true);
      return isHide;
    })
}

function updateLegend(d) {
  var brandLabel = d['Manufacturer']
  // console.log(brandLabel)

  var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
    .shapePadding(75)
    .scale(visGraphInit.scales.colour)
    .orient('horizontal')
    .cellFilter(function(d){ return d.label !== brandLabel })
  d3.select('.legendOrdinal')
    .call(legendOrdinal);
}

// add or subtract the sensivity count with the d being passed
function updateSensitivityCount(d, isAdding) {
  var itemPrice = d['MSRP'];

  for (bucket in sensitivityBuckets) {
    var bucketMin = sensitivityBuckets[bucket]['domain'][0];
    var bucketMax = sensitivityBuckets[bucket]['domain'][1];
    if (itemPrice >= bucketMin && itemPrice < bucketMax) {
      if (isAdding && sensitivityBuckets[bucket]['count'] < sensitivityBuckets[bucket]['maxCount'])
        sensitivityBuckets[bucket]['count'] += 1;
      else if (!isAdding && sensitivityBuckets[bucket]['count'] > 0)
        sensitivityBuckets[bucket]['count'] -= 1;
    }
  }
}

function initSensitivityHistogram() {
  var $bar = ($('#template-sensitivity-bar').html());
  var $histogram = $('[data-sensitivity]');

  for (buckets in sensitivityBuckets) {
    $histogram.append($bar);
  }
}

function redrawSensitivityHistogram() {
  for (bucket in sensitivityBuckets) {
    var height = (sensitivityBuckets[bucket]['count']) / dataCount * 100;
    $($('.jsSensivityBar').get(bucket)).css('height', height+'%');
  }
}

function resetSensitivityBuckets() {
  for (bucket in sensitivityBuckets) {
    sensitivityBuckets[bucket]['count'] = 0;
  }
}

function isOutsideNumberDomain(d, dimension) {
  var newMin = filterCollection[dimension].domain[0]
  var newMax = filterCollection[dimension].domain[1]
  return newMin > d[dimension] || d[dimension] > newMax
}

function isOutsideStringDomain(d, dimension) {
  var thisDomain = filterCollection[dimension].domain
  return !thisDomain.includes(d[dimension])
}

// function updateFilterCollection

// function initSensitivityHistograms() {
//   for (var dimension in dimensionsWithStringsObj) {
//     var thisDomain = dimensionsWithStringsObj[dimension].domain;
//     for (var i=0; i<thisDomain.length; i++) {

//     }
//   }
// }

function getWidthOfSensitivityButton(data, dimensionName, domainName) {
  return '50%';
}
