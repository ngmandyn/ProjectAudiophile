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

// count how many records match a particular columnName
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