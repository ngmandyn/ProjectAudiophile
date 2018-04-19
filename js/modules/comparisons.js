var favouritesCollection = {}
var $favItemShelf = $('.fav-shelf__item-container')

/*
 * called inside dataLoad.js
 * attached to where the circles are created
 */
function favsChangeAndUpdate(d, jqThisCircle) {
  var newFavsName = d['Manufacturer']+' '+d['Model']

  if (favAlreadyExists(d)) {
    delete favouritesCollection[newFavsName]
    removeFavItemFromShelf(d['Manufacturer'], d['Model'], jqThisCircle)
    makeFavCircleSpecial(jqThisCircle, false)
  } 
  // else add the favourite as a new object to the collection
  else if (favLessThanLimit()) {
    var newFav = {}
    newFav[newFavsName] = d
    favouritesCollection = {...favouritesCollection, ...newFav}
    addFavItemToTable(d);
    makeFavCircleSpecial(jqThisCircle);
  }

  var favCount = Object.keys(favouritesCollection).length;
  $('#jsFavCountInsert').html(favCount);
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
  $('[data-fav-item='+parseStringForCode(manufacturer+'-'+model)+']').remove();
  makeFavCircleSpecial(jqThisCircle, false);
}

function makeFavCircleSpecial(thisCircle, isSpecial) {
  if ((typeof(isSpecial) === 'undefined' || typeof(isSpecial) === 'null')) {
    thisCircle.addClass('special')
    thisCircle.attr('filter', 'url(#dropshadow)');
    thisCircle.attr('r', visGraphInit.circles.specialR);
  }
  else if (!isSpecial) {
    thisCircle.removeClass('special')
    thisCircle.attr('filter', '')
    thisCircle.attr('r', visGraphInit.circles.minR);
  }
}

function toggleFavCircleExtraSpecial(circle, isExtraSpecial) {
  if (isExtraSpecial) {
    circle.addClass('extraSpecial');
    circle.attr('r', visGraphInit.circles.extraSpecialR);
  }
  else if (!isExtraSpecial) {
    circle.removeClass('extraSpecial');
    circle.attr('r', visGraphInit.circles.specialR);
  }
}

/*
 * 
 *
 */
function addFavItemToTable(d) {
  var $row = $($('#template-fav-table-row-cells').html());
  var $cancelButton = $($('#template-fav-item-cancel').html());
  var name = d['Manufacturer']+' '+d['Model'];

  attachFavDeleteListenerTo($cancelButton);
  getRowCell($row, 'Model').append($cancelButton).append(name);
  addFavItemDataAttributes(d['Manufacturer'], d['Model'], $row)

  if (isARowSelected()) $row.addClass('isSecondary');

  for (var dimension in dimensionsObj) {
    var $cell = getRowCell($row, dimension);
    var percentageWidth = (d[dimension] / dimensionsObj[dimension].absDomain[1] * 100) + '%';
    appendBarGraphToCell($cell, percentageWidth, d[dimension]);
  }

  appendSoundSignatureToRow(d, $row);

  for (var dimension in dimensionsWithStringsObj) {
    if (isDomainDimensionNeededInDisplay(dimensionsWithStringsObj[dimension].domain, dimension)) {
      var $cell = getRowCell($row, dimension);
      appendQualitativeToRow($cell, dimension, d[dimension]);
    }
  }

  $('.jsFavTableBody').append($row)
  attachRowClickListenerTo($row);
  rowClickExtraSpecialCircleListener();
}

function getRowCell(jqRow, cellDimension) {
  return $(jqRow.find('[data-fav-cell="'+cellDimension+'"]'));
}

/*
 *  Appends a bar graph with the percentage width to the cell
 */
function appendBarGraphToCell(jqCell, percentageWidth, textValue) {
  var $barGraph = $($('#template-bar-graph').html());
  $barGraph.find('.jsBarGraphWidthInsert').css('width', percentageWidth);
  $barGraph.find('.jsBarGraphValueInsert').html(textValue);
  
  jqCell.append($barGraph);
}

function appendSoundSignatureToRow(d, jqRow) {
  var $outerCell = getRowCell(jqRow, 'Sound signature');
  var $ssGroup = $($('#template-sound-sig').html());

  var bass = d['Bass'];
  var mids = d['Midrange'];
  var treble = d['Treble'];
  

  $ssGroup = appendIndividualSoundSignatures(bass, mids, treble, $ssGroup);
  $outerCell.append($ssGroup);
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

function appendQualitativeToRow(jqCell, dimension, value) {
  jqCell.html(value);
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
    // console.log($extraSpecialCircles)
    
    if ($(this).hasClass('isPrimary')) {
      // resetRowHighlights();
      resetRowHighlightsAndCircle($circle);
    }
    else {
      $(this).addClass('isPrimary').removeClass('isSecondary');
      $rows.not($(this)).addClass('isSecondary').removeClass('isPrimary');
    }
  })
}

/*
 *
 */
function rowClickExtraSpecialCircleListener() {
  $('.jsFavTableRow').on('click', function(e) {
    var manuf = $(this).attr('data-fav-manufacturer');
    var model = $(this).attr('data-fav-model');
    var $circle = getCircleWithManufAndModel(manuf, model);
    var $specialCircles = $('.special');

    toggleFavCircleExtraSpecial($specialCircles, false);
      
    if ($(this).hasClass('isPrimary')) {
      toggleFavCircleExtraSpecial($circle, true);
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