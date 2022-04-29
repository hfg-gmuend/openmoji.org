if(OPENMOJIJSON.length > 0){
  initCategoriesShowCase()
}else{
  $(document).on('openmojiJsonLoaded', initCategoriesShowCase)
}

function initCategoriesShowCase() {
  //------------ META ------------
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // get all emojis and generate category showcase
  var EMOJI_LIST = OPENMOJIJSON.filter(function (emoji) {
    return emoji.skintone === "" && emoji.subgroups != "country-flag";
  });

  //------------ Category showcase ------------
  // Object that holds all Categories with their html display name and corresponding group in the emoji list
  const CATEGORIES = {
    "Interaction": "interaction",
    "UI Design": "ui-element",
    "Technology": "technology",
    "Healthcare": "healthcare",
    "Climate Environment": "climate-environment",
  };
  const CATEGORIES_LIMIT = 3;
  const EXAMPLES_COUNT = 6;
  const CATEGORY_SLIDE_INTERVAL_TIMEOUT = 4000;
  var categoryShowcase = $("#categories-showcase");
  var categorySlideInterval;

  // select random categories based on defined limit
  const RANDOM_CATEGORIES = Object.fromEntries(shuffleArr(Object.entries(CATEGORIES)).slice(0, CATEGORIES_LIMIT));

  genCategoriesShowcase();

  function genCategoriesShowcase() {
    // add categories to html
    var html = "<div class='row'>";

    var firstCategory = true;

    for (var category in RANDOM_CATEGORIES) {
      if (RANDOM_CATEGORIES.hasOwnProperty(category)) {
        if (firstCategory) {
          html += "<div class='categories-item'>" +
            "<a class='standardLink active-tab' data-category='" + RANDOM_CATEGORIES[category] + "' href=''>" +
            "<h3 class='visuallyHeadline3'>" + category + "</h3>" +
            "</a>" +
            "</div>";
          firstCategory = false;
        } else {
          html += "<div class='categories-item'>" +
            "<a class='standardLink' data-category='" + RANDOM_CATEGORIES[category] + "' href=''>" +
            "<h3 class='visuallyHeadline3'>" + category + "</h3>" +
            "</a>" +
            "</div>";
        }
      }
    }
    html += "</div>";

    // populate html
    $("#categories-showcase #categories").append(html);

    showCategoryExamples($("#categories-showcase #categories .active-tab").data("category"));

    // set interval to slide to next category every 4 seconds
    categorySlideInterval = setInterval(slideCategory, CATEGORY_SLIDE_INTERVAL_TIMEOUT);
  }

  function showCategoryExamples(category) {
    // empty div
    $("#categories-showcase #examples").empty();

    // mark clicked item as active and currently active item as non active
    $("#categories-showcase #categories .active-tab").removeClass("active-tab");
    $("#categories-showcase #categories").find("[data-category='" + category + "']").addClass("active-tab");

    // get all emojis from specified category
    filteredList = EMOJI_LIST.filter(emoji => emoji.group === category || emoji.subgroups === category);

    // randomize array
    filteredList = shuffleArr(filteredList);

    // add emojis to html
    var html = "";

    html += "<div class='row'>";
    // add emojis
    for (var i = 0; i < EXAMPLES_COUNT; i++) {
      // break out of loop if array doesn't have new emojis anymore
      if (i >= filteredList.length) break;

      html += "<a class='categories-item' href='./library/emoji-" + filteredList[i].hexcode + "'><img alt='" + filteredList[i].annotation + "' src='data/color/svg/" + filteredList[i].hexcode + ".svg'></a>";
    }
    html += "</div>";

    // populate html
    $("#categories-showcase #examples").append(html);

    // set element width based on column count
    $("#categories-showcase .categories-item").css("width", 100 / Object.keys(RANDOM_CATEGORIES).length + "%");
  }

  function slideCategory() {
    var currentCategoryIdx = Object.values(RANDOM_CATEGORIES).indexOf($("#categories-showcase #categories .active-tab").data("category"));

    // increment index
    currentCategoryIdx++;

    // reset index to 0 index is out of array
    if (currentCategoryIdx >= Object.values(RANDOM_CATEGORIES).length) {
      currentCategoryIdx = 0;
    }

    // trigger resize event to avoid jumpy transition
    $(window).trigger($.Event("resize"));

    // update category selection
    showCategoryExamples(Object.values(RANDOM_CATEGORIES)[currentCategoryIdx]);
  }


  //------------ Event listeners ------------

  // switch category when clicked
  if (categoryShowcase) {
    categoryShowcase.on("click", ".categories-item a", function (e) {
      e.preventDefault();

      // check if clicked item is already active
      if (!$(this).hasClass("active-tab")) {
        // refresh example emojis
        showCategoryExamples($(this).data("category"));

        // reset categorySlideInterval
        clearInterval(categorySlideInterval);
      }
    });
  }

  // window resize listener
  $(window).resize(function () {
    // reset min-height to current height of categories showcase container element to avoid jumpy transition when selected category changes
    $("#categories-showcase .content").css("min-height", "");
    $("#categories-showcase .content").css("min-height", $("#categories-showcase .content").height());

    // change duration of scrollmagic animations
    // emoji_left.duration(Math.abs($( "#big-emoji-left-start" ).position().top - $( "#big-emoji-left-end" ).position().top));
    // emoji_right.duration(Math.abs($( ".big-emoji-right-start" ).position().top - $( ".big-emoji-right-end" ).position().top));
  });
  //------------ General Functions ------------
  function shuffleArr(arr) {
    var ctr = arr.length,
      temp, index;

    // While there are elements in the array
    while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = arr[ctr];
      arr[ctr] = arr[index];
      arr[index] = temp;
    }
    return arr;
  }
}