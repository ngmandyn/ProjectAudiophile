var favouritesCollection = {}
var $favItemShelf = $('.fav-shelf__item-container')

/*
 * called inside dataLoad.js
 * attached to where the circles are created
 */
function favsChangeAndUpdate(d, jqThisCircle) {
  // this is just printing the informating in the circle
  // var content = jqThisCircle.find('.tooltip-data')[0].textContent;
  // console.log(content);
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
    // adding fav item also returns the new added jsQuery object
    // $newFavItem = addFavItemToShelf(d['Manufacturer'], d['Model'], jqThisCircle)
    addFavItemToTable(d);
    makeFavCircleSpecial(jqThisCircle);
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

// function addFavItemToShelf(manufacturer, model, jqThisCircle) {
//   var $favItemTemplate = $($('#template-fav-item').html())
//   var $newFavItem = addFavItemDataAttributes(manufacturer, model, $favItemTemplate)
//   $newFavItem.find('.jsFavItemName').html(manufacturer+' '+model)
//   $favItemShelf.append($newFavItem)
//   jqThisCircle.toggleClass('special')

//   return $newFavItem
// }

function removeFavItemFromShelf(manufacturer, model, jqThisCircle) {
  $('[data-fav-item='+parseStringForCode(manufacturer+'-'+model)+']').remove()
  jqThisCircle.removeClass('special')
  // var item = $('[data-fav-manufacturer='+parseStringForCode(manufacturer)+'][data-fav-model='+parseStringForCode(model)+']')
  // console.log(item)
  // item.remove()
}

function makeFavCircleSpecial(clickedCircle) {
  clickedCircle.addClass('special')
}

function toggleFavCircleExtraSpecial(circle, isExtraSpecial) {
  if (isExtraSpecial)
    circle.addClass('extraSpecial');
  else 
    circle.removeClass('extraSpecial');
}

function initFavItemTable() {
  for (var dimension in dimensionsObj) {
    $('.fav-table').find('thead tr').append('<th>'+dimensionsObj[dimension].displayName+' <small>'+dimensionsObj[dimension].units+'</small></th>')
  }

  $('.fav-table').find('thead tr').append('<th>sound signature</th>')

  for (var dimension in dimensionsWithStringsObj) {
    if (isDomainDimensionNeededInDisplay(dimensionsWithStringsObj[dimension].domain, dimension)) {
      $('.fav-table').find('thead tr').append('<th>'+dimensionsWithStringsObj[dimension].displayName+'</th>')
    }
  }
}

/*
 * 
 *
 */
function addFavItemToTable(d) {
  var $row = $($('#template-fav-table-row').html())
  var $cell = $($('#template-fav-table-cell').html());
  var $cancelButton = $($('#template-fav-item-cancel').html());

  var name = d['Manufacturer']+' '+d['Model'];

  attachFavDeleteListenerTo($cancelButton);
  $row.append($cell.append($cancelButton).append(name))

  addFavItemDataAttributes(d['Manufacturer'], d['Model'], $row)

  if (isARowSelected()) $row.addClass('isSecondary');

  for (var dimension in dimensionsObj) {
    var percentageWidth = (d[dimension] / dimensionsObj[dimension].domain[1] * 100) + '%';
    appendBarGraphToCell($row, percentageWidth, d[dimension]);
  }

  appendSoundSignatureToRow(d, $row);

  for (var dimension in dimensionsWithStringsObj) {
    if (isDomainDimensionNeededInDisplay(dimensionsWithStringsObj[dimension].domain, dimension)) {
      appendQualitativeToRow($row, dimension, d[dimension]);
    }
  }

  attachRowClickListenerTo($row);
  $('.jsFavTableBody').append($row)
}

/*
 *  Appends a bar graph with the percentage width to the cell
 */
function appendBarGraphToCell(jqRow, percentageWidth, textValue) {
  var $cell = $($('#template-fav-table-cell').html());

  var $barGraph = $($('#template-bar-graph').html());
  $barGraph.find('.jsBarGraphWidthInsert').css('width', percentageWidth);
  $barGraph.find('.jsBarGraphValueInsert').html(textValue);
  
  $cell.append($barGraph);
  jqRow.append($cell);
}

function appendSoundSignatureToRow(d, jqRow) {
  var $outerCell = $($('#template-fav-table-cell').html());
  var $ssGroup = $($('#template-sound-sig').html());

  var bass = d['Bass'];
  var mids = d['Midrange'];
  var treble = d['Treble'];
  console.log(bass + ' ' + mids + ' ' + treble)

  $ssGroup = appendIndividualSoundSignatures(bass, mids, treble, $ssGroup);
  $outerCell.append($ssGroup);

  jqRow.append($outerCell);
}

function appendIndividualSoundSignatures(bass, mids, treble, jqCell) {
  var templateString = '#template-sound-signature-';
  var bassString = templateString+bass.toLowerCase();
  var midsString = templateString+mids.toLowerCase();
  var trebleString = templateString+treble.toLowerCase();

  var $bass = $($(bassString).html());
  var $mids = $($(midsString).html());
  var $treble = $($(trebleString).html());

  jqCell.append($bass).append($mids).append($treble);
  return jqCell;
}

function appendQualitativeToRow(jqRow, dimension, value) {
  var $cell = $($('#template-fav-table-cell').html());
  $cell.html(value);
  jqRow.append($cell);
}

/*
 * attach the on.click event listener to each cancel button as they're created
 * and remove corresponding favourites
 */
function attachFavDeleteListenerTo(jsCancelButton) {
  jsCancelButton.on('click', function() {
    var $row = $(this).parents('.jsFavTableRow');
    var thisDataManuf = $row.attr('data-fav-manufacturer')
    var thisDataModel = $row.attr('data-fav-model')
    var thisDataFullName = $row.attr('data-fav-full-name').replace(/"/g, '')
    var $circle = $('circle[data-manufacturer='+thisDataManuf+'][data-model='+thisDataModel+']');

    // resets the highlight if the deleted item was highlightsed
    if ($row.hasClass('isPrimary')) { 
      // resetRowHighlights();
      // toggleFavCircleExtraSpecial($circle, false);
      resetRowHighlightsAndCircle($circle);
    }

    delete favouritesCollection[thisDataFullName];
    removeFavItemFromShelf(thisDataManuf, thisDataModel, $circle);
  })
}

/*
 * 
 * 
 */
function attachRowClickListenerTo(jsRow) {
  jsRow.on('click', function(e) {
    // cancels detection on the cancelation button
    if ($(this).hasClass('jsFavItemCancel'))
      return;

    var $rows = $('.jsFavTableRow');
    var manuf = $(this).attr('data-fav-manufacturer');
    var model = $(this).attr('data-fav-model');
    var $circle = getCircleWithManufAndModel(manuf, model);
    
    if ($(this).hasClass('isPrimary')) {
      // resetRowHighlights();
      resetRowHighlightsAndCircle($circle);
    }
    else {
      toggleFavCircleExtraSpecial($circle, true);
      $(this).addClass('isPrimary').removeClass('isSecondary');
      $rows.not($(this)).addClass('isSecondary').removeClass('isPrimary');
    }
  })
}

function resetRowHighlightsAndCircle(circle) {
  resetRowHighlights();
  toggleFavCircleExtraSpecial(circle, false);
}

function resetRowHighlights() {
  var $rows = $('.jsFavTableRow');
  $rows.removeClass('isPrimary').removeClass('isSecondary');
}

function isARowSelected() {
  if ($('.jsFavTableRow').hasClass('isPrimary')) {
    console.log("a primary row exists")
    return true;
  }
  return false;
}

/*
 *
 */
function isDomainDimensionNeededInDisplay(domain, dimension) {
  return typeof(domain) !== 'undefined'
    && dimension !== 'Bass' 
    && dimension !== 'Midrange' 
    && dimension !== 'Treble';
}