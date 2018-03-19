function searchAndBrush() {
  $('input[type=text]').on('keyup', function() {
    var text = $(this).val().replace(/ /g,'-').toLowerCase();

    // "complete" search term if at least 4 characters entered match a brand or model
    if (text.length >= 4) {
      for (var term in searchableValues) {
        if (searchableValues[term].includes(text)) {
          text = searchableValues[term];
        }
      }
    }

    if (text != '' && searchableValues.includes(text)) {
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