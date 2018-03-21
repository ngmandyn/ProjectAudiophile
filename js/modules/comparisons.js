var favouritesCollection = {}
var $favItemShelf = $('.fav-shelf__item-container')

/*
 * called inside dataLoad.js
 * attached to where the circles are created
 */
function favsChangeAndUpdate(d, jqThisCircle) {
  // this is just printing the informating in the circle
  var content = jqThisCircle.find('.tooltip-data')[0].textContent;
  console.log(content);
  var newFavsName = d['Manufacturer']+' '+d['Model']

  if (favAlreadyExists(d)) {
    delete favouritesCollection[newFavsName]
    removeFavItemFromShelf(d['Manufacturer'], d['Model'], jqThisCircle)
  } 
  // else add the favourite as a new object to the collection
  else if (favLessThanLimit()) {
    var newFav = {}
    newFav[newFavsName] = d
    favouritesCollection = {...favouritesCollection, ...newFav}
    addFavItemToShelf(d['Manufacturer'], d['Model'], jqThisCircle)
    addFavItemToTable(d)
  }
}

/*
 * return boolean
 * checks if this data item is already within the 
 * favouritesCollection to prevent duplicate entries
 */
function favAlreadyExists(d) {
  var newFavsName = d['Manufacturer']+' '+d['Model']
  var currentFavouriteKeys = Object.keys(favouritesCollection)
  return currentFavouriteKeys.includes(newFavsName)
}

/* 
 * return boolean
 * checks if the collection has less than the limit (5)
 */
function favLessThanLimit() {
  var currentFavouriteKeys = Object.keys(favouritesCollection)
  return currentFavouriteKeys.length < 5
}

function addFavItemToShelf(manufacturer, model, jqThisCircle) {
  var $favItemTemplate = $($('#template-fav-item').html())
  var $newFavItem = addFavItemDataAttributes(manufacturer, model, $favItemTemplate)
  $newFavItem.find('.jsFavItemName').html(manufacturer+' '+model)
  $favItemShelf.append($newFavItem)
  jqThisCircle.toggleClass('special')
}

function removeFavItemFromShelf(manufacturer, model, jqThisCircle) {
  $('[data-fav-item='+parseStringForCode(manufacturer+'-'+model)+']').remove()
  jqThisCircle.toggleClass('special')
  // var item = $('[data-fav-manufacturer='+parseStringForCode(manufacturer)+'][data-fav-model='+parseStringForCode(model)+']')
  // console.log(item)
  // item.remove()
}

function makeFavCircleSpecial(clickedCircle) {
  clickedCircle.toggleClass('special')
}

function initFavItemTable() {
  for (var dimension in dimensionsObj) {
    $('.fav-table').find('thead tr').append('<th>'+dimensionsObj[dimension].displayName+'</th>')
  }
}

/*
 * 
 *
 */
function addFavItemToTable(d) {
  var $row = $($('#template-fav-table-row').html())
  var $cell = $($('#template-fav-table-cell').html());

  var name = d['Manufacturer']+' '+d['Model'];

  $row.append($cell.html(name))
  addFavItemDataAttributes(d['Manufacturer'], d['Model'], $row)

  for (var dimension in dimensionsObj) {
    var $cell = $($('#template-fav-table-cell').html());
    var $barGraph = $($('#template-bar-graph').html());

    console.log(d[dimension] + ', ' + dimensionsObj[dimension].domain[1])
    var percentageWidth = (d[dimension] / dimensionsObj[dimension].domain[1] * 100) + '%';
    console.log(percentageWidth)

    $barGraph.find('.jsBarGraphWidthInsert').css('width', percentageWidth)
    $barGraph.find('.jsBarGraphValueInsert').html(d[dimension])
    console.log($barGraph)
    $cell.append($barGraph)
    $row.append($cell)
  }

  $('.jsFavTableBody').append($row)
}

function handleFavShelfHideShow() {
  $('#jsCompareFavourites').on('click', function() {
    $('.fav-shelf').toggleClass('is-expanded')
  })
}

function addFavItemDataAttributes(manufacturer, model, jqObj) {
  return jqObj.attr({
    'data-fav-item': parseStringForCode(manufacturer+'-'+model),
    'data-fav-manufacturer': parseStringForCode(manufacturer),
    'data-fav-model': parseStringForCode(model)
  });
}