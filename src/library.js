$(document).ready(function () {
  //------------ Initialization ------------
  $("#emoji-detail-wrapper .popover-wrapper").css("display", "flex").hide();

  //------------ for emoji list ------------
  var EMOJI_LIST;
  var FITZPATRICK_COLOR_PALETTE;
  var LIST_FILTERS;
  var currentList;
  var fuse;
  const FUSE_DEFAULT_THRESHOLD = 0.1;
  const SORT_FUNCS = { // list of possible sort functions NOTE: functions need to sort in ascending order
    "unicode": function (a, b) {
      if (a.item.order === "" && b.item.order === "") {
        return 0;
      } else if (a.item.order === "") {
        return 1;
      } else if (b.item.order === "") {
        return -1;
      }
      return parseInt(a.item.order) - parseInt(b.item.order);
    },
    "alphabetical": function (a, b) {
      return a.item.annotation.localeCompare(b.item.annotation);
    },
    "contribution_date": function (a, b) {
      if (a.item.openmoji_date === "" && b.item.openmoji_date === "") {
        return 0;
      } else if (a.item.openmoji_date === "") {
        return 1;
      } else if (b.item.openmoji_date === "") {
        return -1;
      }
      return new Date(b.item.openmoji_date) - new Date(a.item.openmoji_date);
    },
    "best_match": function (a, b) {
      return a.item.score - b.item.score;
    }
  };

  // for list sort
  const INITIAL_SORT = $("#sort-selector .selector__list .active").data("sortfunc");
  var currentSort = INITIAL_SORT;
  var prevSort = currentSort;
  var currentSortDir = getSortDir();

  var currentLazyInstance;

  $.when(
    $.getJSON("../data/openmoji.json", function (json) {
      var filteredEmojies = {};

      json.forEach(function (item) {
        // NOTE: skintone_base_emoji needs to occur before skintone variants in list
        if (item.skintone !== "" && item.skintone_combination === "single") {
          if (filteredEmojies[item.skintone_base_hexcode].skintones === undefined) filteredEmojies[item.skintone_base_hexcode].skintones = [];
          filteredEmojies[item.skintone_base_hexcode].skintones.push(item);
        } else if(item.skintone !== "" && item.skintone_combination === "multiple") {
          if (filteredEmojies[item.skintone_base_hexcode].skintone_combinations === undefined) filteredEmojies[item.skintone_base_hexcode].skintone_combinations = [];
          filteredEmojies[item.skintone_base_hexcode].skintone_combinations.push(item);
        } else {
          filteredEmojies[item.hexcode] = item;
          filteredEmojies[item.hexcode].item = item; // wrap item inside item key so structure matches with fusejs search
          filteredEmojies[item.hexcode].groupPath = getGroupPath(item.group, item.subgroups);
        }
      });

      EMOJI_LIST = Object.values(filteredEmojies).sort(SORT_FUNCS["unicode"]);
    }),
    $.getJSON("../data/color-palette.json", function (json) {
      FITZPATRICK_COLOR_PALETTE = json.skintones.fitzpatrick;
    }),
    $.getJSON("../data/filterWeights.json", function (json) {
      LIST_FILTERS = json;
    })
  ).then(function () {
    // generate nav-bar
    generateNav();

    // init fuse object
    fuse = new Fuse(EMOJI_LIST, {
      shouldSort: true,
      tokenize: true,
      includeScore: true,
      threshold: FUSE_DEFAULT_THRESHOLD,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 0
    });

    // init currentlist to all emojis
    currentList = EMOJI_LIST;

    // handle possible filters in URL
    handleRequest(getUrlParameters());
  });

  // function to update emoji list filtered by search
  function updateList(filter) {
    var fuseSearchStr = "";

    // check which filters are set to set fuse keys weighting accordingly
    if (filter === undefined || filter.group === "all OpenMojis" && Object.keys(filter).length < 2) {
      fuseSearchStr = "all OpenMojis";
      if (filter === undefined) {
        filter = {};
        filter.group = "all OpenMojis";
      }
      currentList = EMOJI_LIST;
    } else {
      // if only one filter is set and it is not equal to search make sharp search
      if (Object.keys(filter).length == 1 && !filter.search) {
        fuse.options.threshold = 0.0;
        fuse.options.tokenize = false;
      } else {
        fuse.options.threshold = FUSE_DEFAULT_THRESHOLD;
        fuse.options.tokenize = true;
      }

      // set fuse keys according to filter and weighted according to the URL order
      fuse.options.keys = [];
      var weight = 1;
      for (var key in filter) {
        if (filter.hasOwnProperty(key)) {
          var matchingFuseKeys = Object.keys(LIST_FILTERS).filter(function (fKey) {
            return fKey.includes(key);
          });

          if (matchingFuseKeys.length > 0) {
            matchingFuseKeys.forEach(function (mKey) {
              fuse.options.keys.push({
                name: mKey,
                weight: weight
              });
            });

            weight -= 0.1;
          }
        }
      }

      // if filter "search" also add all other keys with percental weighting
      if (filter.search) {
        for (var key in LIST_FILTERS) {
          if (LIST_FILTERS.hasOwnProperty(key)) {
            if (fuse.options.keys.filter(function (fKey) {
                fKey.name === key
              }).length == 0) {
              fuse.options.keys.push({
                name: key,
                weight: Math.round(weight * LIST_FILTERS[key] * 1e2) / 1e2
              });
            }
          }
        }
      }

      // generate fuseSearchStr based on filter entries
      Object.values(filter).forEach(function (currFilter, idx) {
        if (idx == 0) {
          fuseSearchStr += currFilter;
        } else {
          fuseSearchStr += " " + currFilter;
        }
      });

      // filter list with fuse based on searchStr
      currentList = fuse.search(fuseSearchStr);
    }

    // mark nav-item if filter group is set
    if (filter && filter.group) {
      markNavItem(filter.group);
    } else {
      markNavItem(undefined);
    }

    // set search input field value to search filter if it is defined and sort by "best match"
    if (filter && filter.search) {
      $(".search").val(filter.search);

      // show "best_match" sort option and select it
      $("#sort-selector [data-sortfunc=best_match]").removeClass("hidden");
      $("#sort-selector").trigger("selectEl", $("#sort-selector [data-sortfunc=best_match]"))
    } else if ($(".search").val().length > 0 || prevSort === "best_match") {
      $(".search").val("");

      // hide "best_match" sort option and reset sorting to initial sort function
      $("#sort-selector [data-sortfunc=best_match]").addClass("hidden");
      $("#sort-selector").trigger("selectEl", $("#sort-selector [data-sortfunc=" + INITIAL_SORT + "]"));
    } else {
      // hide "best_match" sort option and reset sorting to initial sort function
      $("#sort-selector [data-sortfunc=best_match]").addClass("hidden");
      $("#sort-selector").trigger("selectEl", $("#sort-selector [data-sortfunc=" + INITIAL_SORT + "]"));
    }

    // show fuseSearchStr in HTML
    if (filter && Object.keys(filter).length == 1 && filter.author) fuseSearchStr = "Author: " + fuseSearchStr;
    if (window.width > 768) {
      $("#selected-category").text(fuseSearchStr);
    }

    // generate list
    generateEmojiList();
  }

  // returns sort direction (asc or desc) based on sort selector classes
  function getSortDir() {
    var sortSelector = $("#sort-selector");

    if (sortSelector.hasClass("selector--sortable-asc")) {
      return "asc";
    } else if (sortSelector.hasClass("selector--sortable-desc")) {
      return "desc";
    } else {
      return currentSortDir;
    }
  }

  // generates groupPath string from passed group and subgroups
  function getGroupPath(group, subgroups) {
    if (subgroups === undefined) return group;

    return group + "/" + ($.isArray(subgroups) ? subgroups.join(" ") : subgroups);
  }

  // sorts currentList (default: ascending order) and generates emoji list
  function generateEmojiList() {
    // empty list
    $(".emoji_grid").empty();

    $("html").scrollTop(0);

    // sort list if sort has changed or flip list if sort direction changed
    if (currentSort !== prevSort) {
      prevSort = currentSort;
      currentList.sort(SORT_FUNCS[currentSort]);

      // flip list if sort has to be in descending order
      if (getSortDir() === "desc") {
        currentList.reverse();
      }
    } else if (getSortDir() !== currentSortDir) {
      currentSortDir = getSortDir();
      currentList.reverse();
    }

    // check if show color is selected and add emojis accordingly
    if ($("#show-color .switch input[type=checkbox]").is(":checked")) {
      for (var i = 0; i < currentList.length; i++) {
        var currEmoji = currentList[i].item;
        $(".emoji_grid").append("<div class='emoji_single' id='" + currEmoji.hexcode + "'><div class = 'emoji-container'><img alt='" + currEmoji.annotation + "' class='lazy' data-src='../data/color/svg/" + currEmoji.hexcode + ".svg'></div><div><h3>" + currEmoji.annotation + "</h3><p>" + currEmoji.hexcode + "</p></div></div>");
      }
    } else {
      for (var i = 0; i < currentList.length; i++) {
        var currEmoji = currentList[i].item;
        $(".emoji_grid").append("<div class='emoji_single' id='" + currEmoji.hexcode + "'><div class = 'emoji-container'><img alt='" + currEmoji.annotation + "' class='lazy' data-src='../data/black/svg/" + currEmoji.hexcode + ".svg'></div><div><h3>" + currEmoji.annotation + "</h3><p>" + currEmoji.hexcode + "</p></div></div>");
      }
    }

    // init/refresh lazy loading
    if (currentLazyInstance !== undefined) {
      currentLazyInstance.destroy();
    }
    currentLazyInstance = new LazyLoad({
      elements_selector: ".lazy"
    });
  }

  //------------ URL List filter exposing ------------
  function exposeListFilter(filter) {
    // add filter that already exist in URL to current filter, so they don't get lost
    var currentUrlParams = getUrlParameters();
    // if currentUrlParams are undefined create new object
    if (currentUrlParams === undefined) currentUrlParams = {};
    // remove undefined filters and add new filter to currentUrlParams or update existing ones
    for (var key in filter) {
      if (filter.hasOwnProperty(key)) {
        if (filter[key] === undefined) {
          // also delete in currentUrlParams if it exists there
          if (currentUrlParams.hasOwnProperty(key)) {
            delete currentUrlParams[key];
          }
          delete filter[key];
        } else {
          currentUrlParams[key] = filter[key];
        }
      }
    }

    // expose filter in URL
    var URL;
    if ($.isEmptyObject(currentUrlParams)) {
      URL = window.location.href.substring(0, window.location.href.indexOf("#"));
    } else if (window.location.href.includes("#")) {
      URL = window.location.href.substring(0, window.location.href.indexOf("#") + 1);
    } else {
      URL = window.location.href.substring(0, window.location.href.indexOf("#")) + "#";
    }
    history.pushState(null, "", URL + $.param(currentUrlParams));
    handleRequest(getUrlParameters());
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

  function handleRequest(filter) {
    // open emoji detail view if emoji filter is set else update list
    if (filter && filter.emoji) {
      showEmojiDetails(filter.emoji);
    } else {
      updateList(filter);
    }
  }


  //------------ nav ------------
  function generateNav() {
    var navItems = [];
    var groups = [];

    EMOJI_LIST.forEach(function (openmoji) {
      openmoji = openmoji.item;

      if (!groups.includes(openmoji.group)) {
        groups.push(openmoji.group);

        // get all emojis with specified group
        var filteredByGroup = EMOJI_LIST.filter(function (emoji) {
          return emoji.group == openmoji.group;
        });

        // get all subgroups
        var subgroups = [];
        filteredByGroup.forEach(function (emoji) {
          if (subgroups.indexOf(emoji.subgroups) == -1) {
            subgroups.push(emoji.subgroups);
          }
        });

        // add nav item object to navItems
        navItems.push({
          "group": openmoji.group,
          "subgroups": subgroups
        });
      }
    });

    // populate html with navItems
    navItems.forEach(function (item) {
      // add group
      var html = item.subgroups.length > 0 ? "<li class='mainmenu' data-item='" + item.group + "'>" : "<li data-item='" + item.group + "'>";
      html += "<input id=" + item.group + " type='radio' name='category' value=" + item.group + ">" +
        "<label for=" + item.group + " data-grouppath=" + item.group + ">" + item.group + "</label>" +
        "<ul class='submenu'>";

      // add subgroups
      item.subgroups.forEach(function (subgroup) {
        var groupPath = getGroupPath(item.group, subgroup);

        html += "<li data-item='" + groupPath + "'>" +
          "<input id=" + subgroup + " type='radio' name='category' value=" + subgroup + ">" +
          "<label for=" + subgroup + " data-grouppath='" + groupPath + "'>" + subgroup + "</label>" +
          "</li>";
      });

      html += "</ul></li>";
      // add new nav item in html
      $("#nav-items").append(html);
    });
  }


  //------------ Emoji detail view ------------
  function showEmojiDetails(id) {
    // get in index of current object
    var currEmoji = undefined;
    var baseEmoji = undefined;

    // fetch current emoji from currentList. If current emoji is a skintone variant also set its base emoji
    var emojiIdx = currentList.findIndex(function (el) {
      el = el.item;

      if (el.emoji === id || el.hexcode === id) {
        currEmoji = el;
        return true;
      } else if (typeof el.skintones !== 'undefined' || typeof el.skintone_combinations !== 'undefined') {
        currEmoji = Array.prototype.concat(el.skintones, el.skintone_combinations).find(function (el) {
          return el && (el.emoji === id || el.hexcode === id);
        });

        if (typeof currEmoji !== 'undefined') {
          baseEmoji = el;
          return true;
        }
      }
    });

    // break if emoji wasn't found
    if (typeof currEmoji === 'undefined') {
      console.log("ERROR: Failed to find Emoji");
      return;
    }

    var isSkintoneVariant = typeof baseEmoji !== 'undefined';

    // switch to color if skintone is selected and outline was previous
    if ($("#show-color .switch input[type=checkbox]").is(":checked") === false && isSkintoneVariant) {
      $("#show-color .switch input[type=checkbox]").prop("checked", true);
    }

    // get path
    var colorVariant = $("#show-color .switch input[type=checkbox]").is(":checked") ? "color" : "black";
    var localVariantPath = "../data/" + colorVariant;

    // set base_hexcode data attribute to emoji preview element
    $("#emoji-preview").attr("data-base_hexcode", isSkintoneVariant ? baseEmoji.hexcode : currEmoji.hexcode)

    // reset highlighting
    $("#outline-emoji-preview").removeClass("highlight");
    $("#outline-emoji-image-preview").removeClass("highlight");
    $("#color-emoji-preview").removeClass("highlight");
    $("#color-emoji-image-preview").removeClass("highlight");

    if ($("#show-color .switch input[type=checkbox]").is(":checked") && !isSkintoneVariant) {
      $("#color-emoji-preview").addClass("highlight");
      $("#color-emoji-image-preview").addClass("highlight");
    } else if (!isSkintoneVariant) {
      $("#outline-emoji-preview").addClass("highlight");
      $("#outline-emoji-image-preview").addClass("highlight");
    }

    // show image/circle preview if emoji has skintones or vice versa if it hasn't
    if (typeof currEmoji.skintones === 'undefined' && !isSkintoneVariant) {
      // update preview images
      $("#outline-emoji-image-preview").attr("src", "../data/black/svg/" + currEmoji.hexcode + ".svg");
      $("#color-emoji-image-preview").attr("src", "../data/color/svg/" + currEmoji.hexcode + ".svg");

      // show image preview and hide circle preview
      $("#outline-emoji-preview").removeClass("visible").addClass("hidden");
      $("#color-emoji-preview").removeClass("visible").addClass("hidden");
      $("#skintones-emoji-preview").removeClass("visible").addClass("hidden");
      $("#outline-emoji-image-preview").removeClass("hidden").addClass("visible");
      $("#color-emoji-image-preview").removeClass("hidden").addClass("visible");
    } else {
      // hide image preview and show circle preview
      $("#outline-emoji-image-preview").removeClass("visible").addClass("hidden");
      $("#color-emoji-image-preview").removeClass("visible").addClass("hidden");
      $("#outline-emoji-preview").removeClass("hidden").addClass("visible");
      $("#color-emoji-preview").removeClass("hidden").addClass("visible");
      $("#skintones-emoji-preview").removeClass("hidden").addClass("visible");
    }

    // update main image
    $("#main-emoji-image").attr("src", localVariantPath + "/svg/" + currEmoji.hexcode + ".svg");

    // clear skintones
    $("#skintones-emoji-preview").empty();

    // add skintone selector(s)
    if (
      (isSkintoneVariant &&
        typeof baseEmoji === "object" &&
        baseEmoji !== null &&
        (baseEmoji.hasOwnProperty("skintones") ||
          baseEmoji.hasOwnProperty("skintone_combinations"))) ||
      (typeof currEmoji === "object" &&
        currEmoji !== null &&
        (currEmoji.hasOwnProperty("skintones") ||
          currEmoji.hasOwnProperty("skintone_combinations")))
    ) {
      const skintonesLeft = new Set();
      const skintonesRight = new Set();
      const selectedLeft = isSkintoneVariant
        ? parseInt(
            currEmoji.skintone_combination === "multiple"
              ? currEmoji.skintone.split(",")[0]
              : currEmoji.skintone,
            10
          )
        : undefined;
      const selectedRight = isSkintoneVariant
        ? parseInt(
            currEmoji.skintone_combination === "multiple"
              ? currEmoji.skintone.split(",")[1]
              : currEmoji.skintone,
            10
          )
        : undefined;

      // get possible skintones / skintone combinations
      if (
        (isSkintoneVariant &&
          baseEmoji.hasOwnProperty("skintone_combinations")) ||
        currEmoji.hasOwnProperty("skintone_combinations")
      ) {
        if (isSkintoneVariant) {
          skintonesLeft.add(selectedLeft);
          skintonesLeft.add(selectedRight);
          skintonesRight.add(selectedRight);
          skintonesRight.add(selectedLeft);

          baseEmoji.skintone_combinations.forEach(function (emoji) {
            const skintoneLeft = parseInt(emoji.skintone.split(",")[0], 10);
            const skintoneRight = parseInt(emoji.skintone.split(",")[1], 10);

            if (skintoneLeft === selectedLeft)
              skintonesRight.add(skintoneRight);
            if (skintoneRight === selectedRight)
              skintonesLeft.add(skintoneLeft);
          });
        } else {
          currEmoji.skintones.forEach(function (emoji) {
            skintonesLeft.add(emoji.skintone);
            skintonesRight.add(emoji.skintone);
          });
        }
      } else {
        (isSkintoneVariant ? baseEmoji.skintones : currEmoji.skintones).forEach(
          function (emoji) {
            skintonesLeft.add(emoji.skintone);
          }
        );
      }

      // render skintone selector(s)
      function createSkintoneSelector(skintoneIds, selectedSkintoneId) {
        const selector = $("<div class='skintone-selector'></div>");

        skintoneIds.forEach(function (skintoneId) {
          const elClass = skintoneId === selectedSkintoneId ? "circle highlight" : "circle";
          selector.append(
            "<div class='" +
              elClass +
              "' data-skintone_id='" +
              skintoneId +
              "' style='background-color: " +
              FITZPATRICK_COLOR_PALETTE[skintoneId - 1] +
              ";'></div>"
          );
        });

        return selector;
      }
      if (skintonesLeft.size > 0)
        $("#skintones-emoji-preview").append(
          createSkintoneSelector(Array.from(skintonesLeft).sort(), selectedLeft)
        );
      if (skintonesRight.size > 0)
        $("#skintones-emoji-preview").append(
          createSkintoneSelector(
            Array.from(skintonesRight).sort(),
            selectedRight
          )
        );
    }

    // get attributes
    var emoji = isSkintoneVariant ? baseEmoji.emoji : currEmoji.emoji;
    var annotation = isSkintoneVariant ? baseEmoji.annotation : currEmoji.annotation;
    var hexcodeString = currEmoji.hexcode;

    // create emoji combination links
    var combination = hexcodeString.split("-").map(function(hex) {
      if (hex === "200D") return '<a href="https://emojipedia.org/zero-width-joiner/" target="_blank" rel="noreferrer noopener" class="redlink">ZWJ</a>';
      if (hex === "FE0F") return '<a href="https://emojipedia.org/variation-selector-16/" target="_blank" rel="noreferrer noopener" class="redlink">VS16</a>';
      return '<a href="/library/#emoji='+ hex +'" target="_blank" rel="noreferrer noopener" class="redlink">'+ String.fromCodePoint(parseInt(hex, 16)) +'</a>';
    });
    combination = combination.join(" • ");

    var hexcode_link = isSkintoneVariant ? baseEmoji.hexcode : hexcodeString;
    var openmoji_author = isSkintoneVariant ? baseEmoji.openmoji_author : currEmoji.openmoji_author;
    var group = isSkintoneVariant ? baseEmoji.group : currEmoji.group;
    var subgroups = isSkintoneVariant ? baseEmoji.subgroups : currEmoji.subgroups;
    var groupPath = isSkintoneVariant ? baseEmoji.groupPath : currEmoji.groupPath;

    // update description
    $("#description h2").text(annotation);
    $("#description #unicode").text(hexcodeString).attr("href", "https://www.decodeunicode.org/en/u+" + hexcode_link);
    $("#description #combination").html(combination)
    $("#description #author").text(openmoji_author);
    $("#description #category").text(group).attr("data-grouppath", group);
    $("#description #subcategory").text(subgroups).attr("data-grouppath", groupPath);

    // Emoji description pull from emojipedia via our proxy endpoint
    // e.g. https://openmoji-emojipedia-api.glitch.me/emojis/✅
    fetch("https://openmoji-emojipedia-api.glitch.me/emojis/" + emoji)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.description == "" || response.detail == "Not found.") {
          $("#description .emojipedia").hide();
        } else {
          // console.log(response);
          $("#description .emojipedia").show();
          $("#description #emojipedia-description").text(response.description);
          $("#description .emojipedia-link").attr("href", "https://emojipedia.org/" + currEmoji.emoji + "/");
        }
      })
      .catch(function () {
        $("#description .emojipedia").hide();
      });

    // update path
    $("#description .path a:nth-child(2)").text(currEmoji.group).attr("data-grouppath", currEmoji.group);
    $("#description .path a:nth-child(3)").text(currEmoji.subgroups).attr("data-grouppath", currEmoji.groupPath);

    // update download links
    $("#svg-download-btn").attr("href", localVariantPath + "/svg/" + currEmoji.hexcode + ".svg");
    $("#png-download-btn").attr("href", "/php/download_from_github.php?emoji_hexcode=" + currEmoji.hexcode + "&emoji_variant=" + colorVariant);

    // update prev and next
    if (currentList.length > 1) {
      $(".prev-emoji").show();
      $(".next-emoji").show();

      // set prev and next emoji id
      var prevEmoji;
      var nextEmoji;
      if (emojiIdx == 0) {
        prevEmoji = currentList[currentList.length - 1].item;
        nextEmoji = currentList[emojiIdx + 1].item;
      } else if (emojiIdx == currentList.length - 1) {
        nextEmoji = currentList[0].item;
        prevEmoji = currentList[emojiIdx - 1].item;
      } else {
        prevEmoji = currentList[emojiIdx - 1].item;
        nextEmoji = currentList[emojiIdx + 1].item;
      }

      $(".prev-emoji").attr("id", prevEmoji.hexcode);
      $(".prev-emoji .icon-img").attr("src", localVariantPath + "/svg/" + prevEmoji.hexcode + ".svg");

      $(".next-emoji").attr("id", nextEmoji.hexcode);
      $(".next-emoji .icon-img").attr("src", localVariantPath + "/svg/" + nextEmoji.hexcode + ".svg");
    } else {
      $(".prev-emoji").hide();
      $(".next-emoji").hide();
    }

    $("#emoji-detail-wrapper .popover-wrapper").fadeIn(300);
  }


  //------------ Event listeners ------------
  // nav selection change listener to update EMOJI_LIST based on clicked (sub-)category
  var libraryWrapper = $("#library-wrapper");
  if (libraryWrapper) {
    libraryWrapper.on("click", "#nav-items li label, #category, #subcategory, #description .path a*", function (e) {
      e.preventDefault();

      if ($(this).parent().hasClass("mainmenu")) navItemGotClicked = true;

      // hide popover wrapper if it is shown
      if ($("#emoji-detail-wrapper .popover-wrapper").is(":visible")) {
        $("#emoji-detail-wrapper .popover-wrapper").fadeOut(400);
      }

      exposeListFilter({
        group: $(this).attr("data-grouppath"),
        search: undefined,
        author: undefined,
        emoji: undefined
      });
    });
  }

  // "show color" radio button change listener to change EMOJI_LIST from black to color or vice versa
  $("#show-color .switch input[type=checkbox]").change(function () {
    updateList(getUrlParameters());
  });

  // search field listener to update EMOJI_LIST based on search text when enter is pressed
  $(".search").keydown(function (e) {
    if (e.which == 13) {
      $(this).val().length > 0 ? exposeListFilter({
        search: $(this).val(),
        group: undefined,
        author: undefined,
        emoji: undefined
      }) : exposeListFilter({
        search: undefined
      });
    }
  });

  // click on emoji in list or move through emojis in detail view
  libraryWrapper.on("click", ".emoji_single, .prev-emoji, .next-emoji", function () {
    exposeListFilter({
      emoji: $(this).attr("id")
    });
  });

  // toggle outline and color in emoji detail view
  $("#emoji-preview").on("click", ".circle, .emoji-preview-image", function (e) {
    var target = $(e.target);

    // get hexcode of current base emoji
    emoji_hexcode = $(e.delegateTarget).attr("data-base_hexcode");
    // get base emoji
    const baseEmoji = EMOJI_LIST.find(function(emoji) {
      return emoji.hexcode === emoji_hexcode;
    }).item;

    // toggle "show color" checkbox
    if (target.is($("#color-emoji-preview")) || target.is($("#color-emoji-image-preview"))) {
      $("#show-color .switch input[type=checkbox]").prop("checked", true);
    } else if (target.is($("#outline-emoji-preview")) || target.is($("#outline-emoji-image-preview"))) {
      $("#show-color .switch input[type=checkbox]").prop("checked", false);
    } else if (target.parent().is($(".skintone-selector"))) {
      // set emoji hexcode to hexcode of skintone variant if one was clicked or skintone combination
      let skintoneIdCombination = $(".skintone-selector")
        .map(function () {
          const selector = $(this);

          return selector.is(target.parent())
            ? target.attr("data-skintone_id")
            : selector.find(".highlight").attr("data-skintone_id");
        })
        .get();
      // remove duplicates and combine to string
      skintoneIdCombination = Array.from(new Set(skintoneIdCombination)).join(",");

      const emojiMatch = Array.prototype
        .concat(baseEmoji.skintones, baseEmoji.skintone_combinations)
        .find(function (emoji) {
          return emoji.skintone.toString() === skintoneIdCombination;
        });

      if(typeof emojiMatch === "object" && emojiMatch !== null) emoji_hexcode = emojiMatch.hexcode;
    }

    // update emoji detail view
    exposeListFilter({
      emoji: emoji_hexcode
    });
  });

  // author click listener to filter emoji list by author
  $("#author").click(function (e) {
    e.preventDefault();

    exposeListFilter({
      author: $(this).text(),
      search: undefined,
      group: undefined,
      emoji: undefined
    });
    $("#emoji-detail-wrapper .popover-wrapper").fadeOut(400);
  });

  // close overlay
  $("#close-detailview").click(function () {
    exposeListFilter({
      emoji: undefined
    });
    $("#emoji-detail-wrapper .popover-wrapper").fadeOut(400);
  });

  $("#sort-selector").on("update", function (_, selectedEl) {
    const selectedSortFunction = $(selectedEl).data("sortfunc");

    // if sort function is defined and isn't the same as the current one set new sort function
    if (SORT_FUNCS[selectedSortFunction] !== undefined && selectedSortFunction !== currentSort) {
      prevSort = currentSort;
      currentSort = selectedSortFunction;

      // regenerate emoji list
      generateEmojiList();
    }
  });

  // sort direction toggle
  $("#sort-selector .selector__selected-value").click(function (e) {
    // toggle current sort direction
    var sortSelector = $("#sort-selector");

    if (getSortDir() === "asc") {
      sortSelector.removeClass("selector--sortable-asc");
      sortSelector.addClass("selector--sortable-desc");
    } else if (getSortDir() === "desc") {
      sortSelector.removeClass("selector--sortable-desc");
      sortSelector.addClass("selector--sortable-asc");
    }

    // regenerate emoji list
    generateEmojiList();
  });
});
