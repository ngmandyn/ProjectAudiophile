
function removeTooltip(d, tooltipType) {
  var $tooltip = getTooltip(d, tooltipType);

  if ($tooltip.length > 0) {
    $tooltip.delay(100).animate({
      //fade out the tooltip to ease the transition
      opacity: 0.25 
    }, 200, function() {
      // and then remove it from the canvas
      $tooltip.remove()
    });
  }
}

function showTooltip(d, thisCircle, tooltipType) {
  var headphoneName = d['Manufacturer']+' '+d['Model']

  // if a small tooltip is already created
  // just remove the modifier to prevent copies of the tooltip
  if (tooltipAlreadyExists(d)) {
    getTooltip(d)
      .removeClass('tooltip--small')
      .attr('data-tooltip-type', 'large')
  }
  else {
    var $tooltip = $($('#template-tooltip').html())
    var tooltipPos = thisCircle.position()

    // default tooltip type for identification when adding/removing
    this.tooltipType = 'small';

    $tooltip.find('.tooltip__manufacturer').html(d['Manufacturer'])
    $tooltip.find('.tooltip__model').html(d['Model'])
    $tooltip.find('.tooltip__price').html('$'+d['MSRP'])

    if (typeof(tooltipType) !== 'underfined' && tooltipType === 'large') {
      // remove the modifier class to show the large version
      this.tooltipType = 'large'
      $tooltip.removeClass('tooltip--small')
    }

    $tooltip.css({
        'top': tooltipPos.top,
        'left': tooltipPos.left,
      })
      .attr({
        'data-tooltip': parseStringForCode(headphoneName),
        'data-tooltip-type': this.tooltipType,
      })

    $('.canvas').append($tooltip)
    checkIfFavButtonShouldBeActive(d); // update the favourite state
    checkForFavouriteButtonClickAndUpdate(d); // bind event listener
  }
}

/*
  toggle tooltip show and hide based on whether one is already made
*/
function toggleTooltip(d, thisCircle, tooltipType) {
  var $tooltipLarge = getTooltip(d, 'large')

  if ($tooltipLarge.length > 0) {
    removeTooltip(d, tooltipType)
  } else {
    showTooltip(d, thisCircle, tooltipType)
  }
}

/*
  return boolean
  check if a tooltip already exists for the circle/data point
  to avoid adding more tooltips on hover and clicks than needed 
*/
function tooltipAlreadyExists(d) {
  var headphoneName = d['Manufacturer']+' '+d['Model']
  var $tooltip = $('[data-tooltip='+parseStringForCode(headphoneName)+']')
  return $tooltip.length > 0
}

/*
  update the tooltips top and left position based on the circle
  so that tooltips move with the changing axis
*/
function updateTooltipPositionWithCircle(d, thisCircle) {
  var pos = thisCircle.position()
  var $tooltip = getTooltip(d)
  $tooltip.css({
    'top': pos.top,
    'left': pos.left
  })
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

/*
  return jQuery Object
  find a circle from manufacturer name and model
*/
function getCircleFromManufAndModel(manuf, model) {
  this.manuf = parseStringForCode(manuf)
  this.model = parseStringForCode(model)
  var $circle = $('circle[data-manufacturer='+this.manuf+'][data-model='+this.model+']')
  return $circle
}

/*
  check for click events on the favourite button
*/
function checkForFavouriteButtonClickAndUpdate(d) {
  // console.log($('.tooltip__fav-button'))
  $('.tooltip__fav-button').on('click', function() {
    $(this).toggleClass('isActive')
    var manuf = $(this).parents('.tooltip').find('.tooltip__manufacturer').html()
    var model = $(this).parents('.tooltip').find('.tooltip__model').html()
    var $thisCircle = getCircleFromManufAndModel(manuf, model)

    favsChangeAndUpdate(d, $thisCircle)
  })
}

/*
  check if this data item has been added to favourites, and if so,
  add an isActive class to the button (to relate to the state of the data)
*/
function checkIfFavButtonShouldBeActive(d) {
  if (favAlreadyExists(d)) 
    getTooltip(d).find('.tooltip__fav-button').addClass('isActive')
}

// function checkForExitButtonClick($tooltip) {}