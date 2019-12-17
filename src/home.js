$(document).ready(function () {
  //------------ Emoji Cloud ------------
  var EMOJI_LIST;
  var EMOJI_AMOUNT;
  var EMOJI_FLAGS_AMOUNT;
  var EMOJI_VERSION;
  const EMOJI_COUNT = 300;
  const EMOJI_POSITIONS = getPositions(1.4, EMOJI_COUNT);
  // get all emojis and generate category showcase
  $.getJSON("data/package.json", function (json) {
    EMOJI_VERSION = json.version;

    setVersion();
  });
  $.getJSON("data/openmoji.json", function (json) {
    EMOJI_AMOUNT = parseInt(json.length);
    EMOJI_FLAGS_AMOUNT = parseInt(json.filter(function (emoji) {
      return emoji.group == "flags";
    }).length);
    EMOJI_LIST = json.filter(function (emoji) {
      return emoji.skintone === "" && emoji.subgroups != "country-flag";
    });

    setEmojiCounter();
    setEmojiFlagCounter();
    genEmojiCloud();
    genCategoriesShowcase();
    // initBigEmojiOverview();
    $(".lazy").Lazy();
  });

  function setVersion() {
    if (EMOJI_VERSION.length !== 0) {
      EMOJI_VERSION = EMOJI_VERSION.split(".");
      $("#emoji-version").text(EMOJI_VERSION[0] + "." + EMOJI_VERSION[1]);
    }
  }

  function setEmojiCounter() {
    if (EMOJI_AMOUNT.length !== 0) {
      $("#emoji-amount").text(EMOJI_AMOUNT);
    }
  }

  function setEmojiFlagCounter() {
    if (EMOJI_FLAGS_AMOUNT.length !== 0) {
      $("#flag-amount").text(EMOJI_FLAGS_AMOUNT);
    }
  }

  function genEmojiCloud() {
    // randomize EMOJI_LIST
    shuffledList = shuffleArr(EMOJI_LIST);

    // populate html with emojis
    for (var i = 0; i < EMOJI_POSITIONS.length; i++) {
      // break out of loop if array doesn't have new emojis anymore
      if (i >= shuffledList.length) break;

      var xPos = EMOJI_POSITIONS[i].x + 50;
      var yPos = EMOJI_POSITIONS[i].y + 50;

      // add emoji to html
      if (!(xPos >= -5 && xPos <= 105 && yPos >= 0 && yPos <= 100)) $("#landing .content").append("<a href='./library#emoji=" + shuffledList[i].hexcode + "'><img class='emoji lazy' alt='' src='' data-src='data/color/svg/" + shuffledList[i].hexcode + ".svg' align='middle' style='top: " + xPos + "%; left: " + yPos + "%'></a>");
    }
  }

  // get emoji positions based on the Vogel/Fermat spiral Equation
  function getPositions(a, n) {
    var positions = [];
    const GOLDEN_ANGLE = 137.508;

    for (var i = 1; i <= n; i++) {
      var theta = i * GOLDEN_ANGLE;

      // calculate x and y position
      var xPos = Math.sign(a) * Math.abs(a) * Math.pow(theta, 0.5) * Math.cos(theta);
      var yPos = Math.sign(a) * Math.abs(a) * Math.pow(theta, 0.5) * Math.sin(theta);

      // push coordinates into position array
      positions.push({
        x: xPos,
        y: yPos
      });
    }

    return positions;
  }


  //------------ Big overview scroll animation ------------
  function initBigEmojiOverview() {
    var scrollMagicController = new ScrollMagic.Controller();
    var emoji_pool = {
      emoji_left: ["1F420"],
      emoji_right: ["1F6F8"]
    };

    // set random emojis for showcase
    $("#big-emoji-left").attr("data-src", "data/color/svg/" + shuffleArr(emoji_pool.emoji_left)[0] + ".svg");
    $(".big-emoji-right").attr("data-src", "data/color/svg/" + shuffleArr(emoji_pool.emoji_right)[0] + ".svg");

    var emoji_left = new ScrollMagic.Scene({
        triggerElement: "#big-emoji-left-start",
        duration: Math.abs($("#big-emoji-left-start").position().top - $("#big-emoji-left-end").position().top)
      })
      .setPin("#big-emoji-left")
      .setTween("#big-emoji-left", {
        scale: 2,
        transformOrigin: "100% 50%"
      })
      .addTo(scrollMagicController);
    var emoji_right = new ScrollMagic.Scene({
        triggerElement: ".big-emoji-right-start",
        duration: Math.abs($(".big-emoji-right-start").position().top - $(".big-emoji-right-end").position().top)
      })
      .setPin(".big-emoji-right")
      .setTween(".big-emoji-right", {
        scale: 2,
        transformOrigin: "0% 50%"
      })
      .addTo(scrollMagicController);
  }


  //------------ Category showcase ------------
  // Object that holds all Categories with their html display name and corresponding group in the emoji list
  const CATEGORIES = {
    "Interaction": "interaction",
    "UI Design": "ui-element",
    "Technology": "technology"
  };
  const EXAMPLES_COUNT = 6;
  const CATEGORY_SLIDE_INTERVAL_TIMEOUT = 4000;
  var categoryShowcase = $("#categories-showcase");
  var categorySlideInterval;

  function genCategoriesShowcase() {
    // add categories to html
    var html = "<div class='row'>";

    var firstCategory = true;

    for (var category in CATEGORIES) {
      if (CATEGORIES.hasOwnProperty(category)) {
        if (firstCategory) {
          html += "<div class='categories-item'>" +
            "<a class='active-tab' data-category='" + CATEGORIES[category] + "' href=''>" +
            "<h3>" + category + "</h3>" +
            "</a>" +
            "</div>";
          firstCategory = false;
        } else {
          html += "<div class='categories-item'>" +
            "<a data-category='" + CATEGORIES[category] + "' href=''>" +
            "<h3>" + category + "</h3>" +
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

      html += "<a class='categories-item' href='./library#emoji=" + filteredList[i].hexcode + "'><img alt='" + filteredList[i].annotation + "' src='data/color/svg/" + filteredList[i].hexcode + ".svg'></a>";
    }
    html += "</div>";

    // populate html
    $("#categories-showcase #examples").append(html);

    // set element width based on column count
    $("#categories-showcase .categories-item").css("width", 100 / Object.keys(CATEGORIES).length + "%");
  }

  function slideCategory() {
    var currentCategoryIdx = Object.values(CATEGORIES).indexOf($("#categories-showcase #categories .active-tab").data("category"));

    // increment index
    currentCategoryIdx++;

    // reset index to 0 index is out of array
    if (currentCategoryIdx >= Object.values(CATEGORIES).length) {
      currentCategoryIdx = 0;
    }

    // trigger resize event to avoid jumpy transition
    $(window).trigger($.Event("resize"));

    // update category selection
    showCategoryExamples(Object.values(CATEGORIES)[currentCategoryIdx]);
  }


  //------------ Event listeners ------------
  // search field listener to change location to ./library and set search filter
  $(".search").keydown(function (e) {
    var url = window.location.href;
    if (e.which == 13) {
      window.location.href = url.substring(0, url.lastIndexOf("/") + 1) + "./library#search=" + $(this).val();
    }
  });

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

  // window scroll listener
  $(window).scroll(function () {
    // toggle visibility of header search field based on position
    var headerOffset = $(window).scrollTop() - $("header").offset().top;

    if (!$("header .emoji-search").is(":visible") && headerOffset == 0) {
      $("header .emoji-search").fadeIn(150);
    } else if ($("header .emoji-search").is(":visible") && headerOffset != 0) {
      $("header .emoji-search").fadeOut(150);
    }
  });
});
