// module.exports = {};

// searches for whole and decimal numbers
var stripUnitRegex = /[0-9]+\.?/;
// searches for all alphanumeric and underscore characters
var parseEmptyRegex = /\w+/;

// returns a boolean of whether the parameter value is empty or not
function notEmpty(value) {
  return (typeof value !== 'undefined' &&
          (typeof value === 'number' || value.match(parseEmptyRegex) !== null));
}

// filter units - drop the unit string, convert resulting number to integer
function stripUnits(data) {
  return +data.match(stripUnitRegex);
}

// filter units in columns defined in arrOfColumnNames
function stripUnitsForColumns(data, arrOfColumnNames) {
  arrOfColumnNames.forEach(function(name) {
    if (data[name] && notEmpty(data[name])) {
      data[name] = stripUnits(data[name]);
    }
  });
}

function trimWhitespace(data, arrOfColumnNames) {
  arrOfColumnNames.forEach(function(name) {
    if (data[name] && notEmpty(data[name])) {
      data[name] = data[name].trim();
    }
  });
}


// returns the max within the columnName of data
function getMax(data, columnName) {
  return d3.max(data, function(d) {
    return d[columnName];
  });
}

// returns the min within the columnName of data
function getMin(data, columnName) {
  var arr = [];
  d3.map(data, function(d) {
    arr.push(d[columnName]);
  });
  return d3.min(arr.filter(notEmpty));
}

// returns the sum of the columnName of data
function getSum(data, columnName) {
  return d3.sum(data, function(d) {
    return d[columnName];
  })
}

// average a set of values from 'columnName'
function getMean(data, columnName) {
  // use d3's mean method
  var mean = d3.mean(data, function(d) {
    return d[columnName];
  });
  return mean;
}

/* 
  count how many records match a particular columnName
*/
function getCount(data, columnName) {
  var arr = [];
  // create an array containging only values within 'columnName'
  d3.map(data, function(d) {
    arr.push(d[columnName]);
  });
  // filter the array for empty or null values
  var filtered = arr.filter(notEmpty);

  return filtered.length;
}

/*
  get count of all the individual dimension elements
  returns an array of counts corresponding to the order of the domain
*/
function getCountOfDomainElement(data, dimension, domainElem) {
  var count = 0;

  d3.map(data, function(d) {
    if (d[dimension] === domainElem) count++;
  });

  return count;
}

/*
  get count of all the domain elements
  data
  dimension: string
  domain: array
*/
// function getCounfOfAllDomainElements(data, dimension, domain) {
//   var domainLength = domain.length;

//   var domainCountArr = [];
//   for (var i = 0; i < domainLength; i++) {
//     domainCountArr.
//   }
// }

function join(lookupTable, mainTable, lookupKey, mainKey, select) {
  var l = lookupTable.length,
      m = mainTable.length,
      lookupIndex = [],
      output = [];
  for (var i = 0; i < l; i++) { // loop through l items
      var row = lookupTable[i];
      lookupIndex[row[lookupKey]] = row; // create an index for lookup table
  }
  for (var j = 0; j < m; j++) { // loop through m items
      var y = mainTable[j];
      var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
      output.push(select(y, x)); // select only the columns you need
  }
  return output;
};

function parseStringForCode(string) {
  return string.replace(/ /g, '-').replace(/[/()]/g, '').toLowerCase()
}

function parseStringForDimension(string) {
  return string.replace(/-/g, ' ').charAt(0).toUpperCase()
}


/*
  return jQuery Object
  get the jquery tooltip object from the data
  and an optional tooltipType if looking for small or large
*/
function getTooltip(d, tooltipType) {
  var headphoneName = parseStringForCode(d['Manufacturer']+' '+d['Model'])
  var $tooltip;

  if (typeof(tooltipType) !== 'undefined') {
    $tooltip = $('[data-tooltip='+headphoneName+'][data-tooltip-type='+tooltipType+']')
  }
  else {
    $tooltip = $('[data-tooltip='+headphoneName+']')
  }

  return $tooltip
}

/*
  return jQuery Object
  get the jquery circle object from the data
*/
function getCircle(d) {
  var manuf = parseStringForCode(d['Manufacturer'])
  var model = parseStringForCode(d['Model'])
  var $circle = $('circle[data-manufacturer='+manuf+'][data-model='+model+']')
  return $circle
}

function getCircleWithManufAndModel(manuf, model) {
  var $circle = $('circle[data-manufacturer='+manuf+'][data-model='+model+']');
  return $circle;
}

/*
 *  Adds a set of data attributes to the jqObj passed.
 *
 *  data-fav-item
 *  data-fav-manufacturer
 *  data-fav-model
 *  data-fav-full-name: "string" with capitalization and spaces
 */
function addFavItemDataAttributes(manufacturer, model, jqObj) {
  return jqObj.attr({
    'data-fav-item': parseStringForCode(manufacturer+'-'+model),
    'data-fav-manufacturer': parseStringForCode(manufacturer),
    'data-fav-model': parseStringForCode(model),
    'data-fav-full-name': '"'+manufacturer+' '+model+'"'
  });
}