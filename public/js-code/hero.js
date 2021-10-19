$(document).ready(function () {
  //------------ META ------------
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  console.log('rreeeeeeeady');

  //------------ Emoji Cloud ------------
  var EMOJI_LIST;
  var EMOJI_AMOUNT;
  var EMOJI_FLAGS_AMOUNT;
  var EMOJI_VERSION;
  const EMOJI_COUNT = 300;
  const EMOJI_POSITIONS = getPositions(isMobile ? 1.1 : 1.4, EMOJI_COUNT);
  // get all emojis and generate category showcase
  $.getJSON("data/openmoji.json", function (json) {
    EMOJI_AMOUNT = parseInt(json.length);
    EMOJI_FLAGS_AMOUNT = parseInt(json.filter(function (emoji) {
      return emoji.group == "flags";
    }).length);
    EMOJI_LIST = json.filter(function (emoji) {
      return emoji.skintone === "" && emoji.subgroups != "country-flag";
    });

    genEmojiCloud();
    // initBigEmojiOverview();
    // var lazyLoadInstance = new LazyLoad({
    //     elements_selector: ".lazy"
    // });
  });

  function genEmojiCloud() {
    // randomize EMOJI_LIST
    const shuffledList = shuffleArr(EMOJI_LIST);

    const isSmall = isMobile;
    const BOUNDARIES = {
      xMin: isSmall ? 0 : -5,
      xMax: isSmall ? 85 : 105,
      yMin: 0,
      yMax: isSmall ? 95 : 100,
    };

    // populate html with emojis
    for (var i = 0; i < EMOJI_POSITIONS.length; i++) {
      // break out of loop if array doesn't have new emojis anymore
      if (i >= shuffledList.length) break;

      var xPos = EMOJI_POSITIONS[i].x + 50;
      var yPos = EMOJI_POSITIONS[i].y + 50;

      // add emoji to html
      if (
        !(
          xPos >= BOUNDARIES.xMin &&
          xPos <= BOUNDARIES.xMax &&
          yPos >= BOUNDARIES.yMin &&
          yPos <= BOUNDARIES.yMax
        )
      )
        $("#emojiCloud").append(
          "<a href='./library#emoji=" +
            shuffledList[i].hexcode +
            "'><img class='emoji lazy' alt='' src='data/color/svg/" +
            shuffledList[i].hexcode +
            ".svg' align='middle' style='left: " +
            xPos +
            "%; top: " +
            yPos +
            "%'></a>"
        );
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

  //------------ Event listeners ------------
  // search field listener to change location to ./library and set search filter
  $(".search").keydown(function (e) {
    var url = window.location.href;
    if (e.which == 13) {
      window.location.href = url.substring(0, url.lastIndexOf("/") + 1) + "./library#search=" + $(this).val();
    }
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
});