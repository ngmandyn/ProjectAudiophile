// combines the dimensions together into one object of all selected filters
// and removes the 'Model' because it is not filterable.
// TODO: update Manufacturer
function initFilterCollection() {
  filterCollection = {...dimensionsObj, ...dimensionsWithStringsObj}
  delete filterCollection.Manufacturer
  delete filterCollection.Model
}

// adds or removed values from the selection list based on what was changed
function handleCheckboxFilterList(thisCheckbox) {
  var parentDimension = thisCheckbox.parents('section').attr('data-filter-dimension')
  var parentDimensionName = parentDimension.replace(/-/g, ' ')
  var thisValue = thisCheckbox.attr('data-filter-'+parentDimension.toLowerCase())
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

    // TODO: combine these conditionals with the range conditionals
    checkCircleAgainstFilters()
  });
}

function sliderChangeAndUpdate() {
  $('[data-slider]').on('moved.zf.slider', function() {
    var adjustingDimension = $(this).parents('[data-filter-section]').attr('data-filter-dimension')
    var dimensionName = adjustingDimension.replace(/-/g, ' ')
    var dimensionDisplayName = adjustingDimension.replace(/ /g, '-').toLowerCase()
    // TODO: make a function for this?
    // be careful to parseInt values, as they are usually returned as strings
    var newMin = parseInt($(this).find('input.js-slider-min').val())
    var newMax = parseInt($(this).find('input.js-slider-max').val())
    var newDomain = [newMin, newMax]
    filterCollection[dimensionName].domain = newDomain

    // hide points that don't fit new domain
    checkCircleAgainstFilters()

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

function checkCircleAgainstFilters() {
  d3.selectAll('circle')
    .classed('hide', function(d) {
      var isHide = false;
      for (var dimension in filterCollection) {
        var checkingDomain = filterCollection[dimension].domain

        if (typeof(checkingDomain[0]) === 'number' &&
          isOutsideNumberDomain(d, dimension)) {
          // console.log('checking number domain')
          isHide = true;
        } else if (typeof(checkingDomain[0]) === 'string' &&
          isOutsideStringDomain(d, dimension)) {
          // console.log('isOutsideStringDomain: '+dimension+', '+d[dimension])
          // console.log(checkingDomain)
          isHide = true;
        }
      }

      return isHide;
    })
}

function isOutsideNumberDomain(d, dimension) {
  var newMin = filterCollection[dimension].domain[0]
  var newMax = filterCollection[dimension].domain[1]
  // console.log('isOutsideNumberDomain '+dimension+': \n'+d[dimension]+' vs '+'['+newMin+', '+newMax+']')
  // console.log(newMin > d[dimension] || d[dimension] > newMax)
  return newMin > d[dimension] || d[dimension] > newMax
}

function isOutsideStringDomain(d, dimension) {
  var thisDomain = filterCollection[dimension].domain
  // console.log('isOutsideStringDomain checking...')
  // console.log(!thisDomain.includes(d[dimension]))

  return !thisDomain.includes(d[dimension])
}

// function updateFilterCollection