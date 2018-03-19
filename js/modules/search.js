function searchAndBrush() {
  $('#searchbar').on('keyup', function() {
    var text = $(this).val().replace(/ /g,'-').toLowerCase();

    // "complete" search term if at least 4 characters entered match a brand or model
    if (text.length >= 4) {
      for (var term in brushableValues) {
        if (brushableValues[term].includes(text)) {
          text = brushableValues[term];
        }
      }
    }

    if (text != '' && brushableValues.includes(text)) {
      // give non-matches lighter opacity
      // give matches full opacity
      d3.selectAll('circle')
        .attr('opacity', '0.1')
      d3.selectAll('[data-manufacturer='+text+']')
        .attr('opacity', '1')
      d3.selectAll('[data-model='+text+']')
        .attr('opacity', '1')
    } else if (text == '') {
      // give circles full opacity if no search term entered
      d3.selectAll('circle')
        .attr('opacity', '1')
    } else {
      // give circles lighter opacity if no match found
      d3.selectAll('circle')
        .attr('opacity', '0.1')
    }

  });
}

function brushWithLegend() {
  $('.cell').on('mouseover', function() {
    var text = parseStringForCode($(this).find('.label').text());

    // give circles full opacity when hovering over legend cells
    // give non-matches lighter opacity
    if (brushableValues.includes(text)) {
      d3.selectAll('circle')
        .attr('opacity', '0.1')
      d3.selectAll('[data-manufacturer='+text+']')
        .attr('opacity', '1')
      d3.selectAll('[data-model='+text+']')
        .attr('opacity', '1')
      d3.selectAll('[data-form-factor='+text+']')
        .attr('opacity', '1')
      d3.selectAll('[data-amp-required='+text+']')
        .attr('opacity', '1')
    }

  });

  // return circles to full opacity when hovering outside legend cells
  $('.cell').on('mouseout', function() {
    d3.selectAll('circle')
        .transition().duration(200)
        .attr('opacity', '1')
  });

}