$(document).ready(function () {
  let currentFilter = 'all';
  let currentSort = 'unicode';
  let currentSortDirection = 'asc';
  const allEmoji = $('.emoji_single');

  

  $("#change-category").click(function () {
    var nav = $(".nav-left");
    nav.addClass("mobile-show");
    $(".mainmenu").click(function () {
      $(".submenu li").click(function () {
        nav.removeClass("mobile-show");
      });
    });
    $(".category-close").click(function () {
      nav.removeClass("mobile-show");
    });
  });

  // Color toggle
  $("#show-color .switch input[type=checkbox]").change(function () {
    const isColor = this.checked;
    showOnlyColoredEmojis(isColor);
    updateList(getUrlParameters());
  });

  // Sort direction toggle
  $('.sort-direction.asc').click(function () {
    updateSortDirection('asc');
  });

  $('.sort-direction.desc').click(function () {
    updateSortDirection('desc');
  });

  $("#sort-selector .selector__list li").click(function () {
    const sortByFunction = $(this).data("sortfunc");
    const sortByName = $(this).html();
    sortEmojiBy(sortByFunction, sortByName);
  });

  $("#filter-selector .selector__list li").click(function () {
    const filterFunctionName = $(this).data("filterfunc");
    const filterName = $(this).html();
    filterEmoji(filterFunctionName, filterName);
  });

  function showOnlyColoredEmojis(isColor){
    if(isColor){
      $('.emoji-variant-color').removeClass('hidden')
      $('.emoji-variant-black').addClass('hidden')
    }else{
      $('.emoji-variant-color').addClass('hidden')
      $('.emoji-variant-black').removeClass('hidden')
    }
  }

  function sortEmojiBy(newSort, sortName){
    //if(currentSort !== newSort){
      $('#sortName').html(sortName);
      sortEmoji(newSort);
      currentSort = newSort;
    //}
  }

  function sortEmoji(sortType){
    allEmoji.each(function () {
      const element = $(this);
      if(sortType === 'unicode'){
        element.css('order', 'unset')
      }else{
        const newOrderNumber = element.data('order-' + sortType);
        element.css('order', newOrderNumber);
      }
    })
  }

  function filterEmoji(newFilter, filterName){
    if(currentFilter !== newFilter){
      $('#filterName').html(filterName);

      // Show all
      if(newFilter === 'all'){
        allEmoji.each(function () {
          const element = $(this);
          element.removeClass('hiddenDueToFilter');
        })

      // Show only the ones with single skintones
      }else if(newFilter === 'skintones'){
        allEmoji.each(function () {
          const element = $(this);
          const hasSkintones = element.data("skintones");
          if(hasSkintones === true){
            element.removeClass('hiddenDueToFilter');
          }else{
            element.addClass('hiddenDueToFilter');
          }
        })

      // Show only the ones with multiple skintones
      }else if(newFilter === 'multi_skintones'){
        allEmoji.each(function () {
          const element = $(this);
          const hasSkintones = element.data("multiskintones");
          if(hasSkintones === true){
            element.removeClass('hiddenDueToFilter');
          }else{
            element.addClass('hiddenDueToFilter');
          }
        })
      }

      currentFilter = newFilter;
    }
  }

  function updateSortDirection(newSortDirection){
    if(newSortDirection !== currentSortDirection){
      if (newSortDirection === "asc") {
        $('#emoji_grid').css('flex-wrap', 'wrap');
        $('.sort-direction.asc').addClass('hidden')
        $('.sort-direction.desc').removeClass('hidden')
      } else if (newSortDirection === "desc") {
        $('#emoji_grid').css('flex-wrap', 'wrap-reverse');
        $('.sort-direction.asc').removeClass('hidden')
        $('.sort-direction.desc').addClass('hidden')
      }
      currentSortDirection = newSortDirection;
    }
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