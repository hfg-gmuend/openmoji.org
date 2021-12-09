$(document).ready(function () {
  // Color toggle
  $("#show-color .switch input[type=checkbox]").change(function () {
    updateList(getUrlParameters());
  });

  // Sort direction toggle
  $('.sort-direction.asc').click(function () {
    updateSort('asc');
  });

  $('.sort-direction.desc').click(function () {
    updateSort('desc');
  });

  $("#filter-selector").on("update", function (_, selectedEl) {
    const selectedFilterFunction = $(selectedEl).data("filterfunc");

    // if filter function is defined and isn't the same as the current one set new filter function
    if (FILTER_FUNCS[selectedFilterFunction] !== undefined && selectedFilterFunction !== currentFilter) {
      currentFilter = selectedFilterFunction;

      // regenerate emoji list
      updateList(getUrlParameters());
    }
  });

  function updateSort(sortDirection){
    if (sortDirection === "asc") {
      $('.sort-direction.asc').addClass('hidden')
      $('.sort-direction.desc').removeClass('hidden')
    } else if (sortDirection === "desc") {
      $('.sort-direction.asc').removeClass('hidden')
      $('.sort-direction.desc').addClass('hidden')
    }

    console.log('something happened', sortDirection);
    // regenerate emoji list
    //generateEmojiList();
  }

  function updateList(urlParameters){
    console.log(urlParameters);
  }

  function getUrlParameters() {
    var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
      sURLVariables = sPageURL.split("&"),
      sParameters = {},
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      var currentParam = sURLVariables[i].split("=");
      sParameters[currentParam[0]] = currentParam[1];
    }
    return sPageURL ? sParameters : undefined;
  }
});