let emojiDetailWrapper = null;
//$(document).ready(function () {
emojiDetailWrapper = $("#emoji-detail-wrapper .popover-wrapper");
emojiDetailWrapper.css("display", "flex").hide();

openPopopAccordingToUrl();

$("#emoji-preview").on("click", ".circle, .emoji-preview-image", function (e) {
  handlePreviewChange(e)
});
//})

function openPopopAccordingToUrl(){
  var currentUrlParams = getUrlParameters();
  if(currentUrlParams && currentUrlParams.emoji){
    showEmojiDetails(currentUrlParams.emoji)
  }
}

function handlePreviewChange(e){
  // toggle outline and color in emoji detail view
    var target = $(e.target);

    // get hexcode of current base emoji
    emoji_hexcode = $(e.delegateTarget).attr("data-base_hexcode");
    // get base emoji

    const baseEmoji = OPENMOJIJSON.find(function(emoji) {
      return emoji.hexcode === emoji_hexcode;
    });

    console.log(baseEmoji)

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

    exposeListFilter({
      emoji: emoji_hexcode
    });
    // update emoji detail view
    showEmojiDetails(emoji_hexcode)
}

function closePopupAndTriggerUpdate(){
  emojiDetailWrapper.fadeOut(400);
  setTimeout(function(){
    updateViewAccordingToUrl() /* This is a function from library-navigation */  
  })
}

function closeEmojiDetails(){
  exposeListFilter({
    emoji: undefined
  });
  emojiDetailWrapper.fadeOut(400);
}

function showEmojiDetails(hex, event) {
    if(event){
      event.preventDefault();
    }
    // get in index of current object
    var currEmoji = undefined;
    var baseEmoji = undefined;

    for(let index in OPENMOJIJSON){
      if(OPENMOJIJSON[index].hexcode === hex){
        currEmoji = OPENMOJIJSON[index]
      }
    }

    // fetch current emoji from currentList. If current emoji is a skintone variant also set its base emoji
    // var emojiIdx = currentList.findIndex(function (el) {
    //   el = el.item;

    //   if (el.emoji === hex || el.hexcode === hex) {
    //     currEmoji = el;
    //     return true;
    //   } else if (typeof el.skintones !== 'undefined' || typeof el.skintone_combinations !== 'undefined') {
    //     currEmoji = Array.prototype.concat(el.skintones, el.skintone_combinations).find(function (el) {
    //       return el && (el.emoji === hex || el.hexcode === hex);
    //     });

    //     if (typeof currEmoji !== 'undefined') {
    //       baseEmoji = el;
    //       return true;
    //     }
    //   }
    // });

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
    var localVariantPath = "/data/" + colorVariant;

    console.log(currEmoji, isSkintoneVariant, colorVariant, localVariantPath)

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
      $("#outline-emoji-image-preview").attr("src", "/data/black/svg/" + currEmoji.hexcode + ".svg");
      $("#color-emoji-image-preview").attr("src", "/data/color/svg/" + currEmoji.hexcode + ".svg");

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
        let fitzpatrickColorPalette = ["#fadcbc", "#debb90", "#c19a65", "#a57939", "#6a462f"]
        
        skintoneIds.forEach(function (skintoneId) {
          const elClass = skintoneId === selectedSkintoneId ? "circle highlight" : "circle";
          selector.append(
            "<div class='" +
              elClass +
              "' data-skintone_id='" +
              skintoneId +
              "' style='background-color: " +
              fitzpatrickColorPalette[skintoneId - 1] +
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

    $("#description #author").text(openmoji_author).attr('href', '#author=' + openmoji_author);
    $("#description #category").text(group).attr("data-grouppath", group).attr('href', '#group=' + group);
    $("#description #subcategory").text(subgroups).attr("data-grouppath", groupPath).attr('href', '#group=' + group + '%2F' + subgroups);

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
    $("#png-download-btn").attr("href", "../php/download_asset.php?type=emoji&emoji_hexcode=" + currEmoji.hexcode + "&emoji_variant=" + colorVariant);

    // update prev and next
    // if (currentList.length > 1) {
    //   $(".prev-emoji").show();
    //   $(".next-emoji").show();

    //   // set prev and next emoji id
    //   var prevEmoji;
    //   var nextEmoji;
    //   if (emojiIdx == 0) {
    //     prevEmoji = currentList[currentList.length - 1].item;
    //     nextEmoji = currentList[emojiIdx + 1].item;
    //   } else if (emojiIdx == currentList.length - 1) {
    //     nextEmoji = currentList[0].item;
    //     prevEmoji = currentList[emojiIdx - 1].item;
    //   } else {
    //     prevEmoji = currentList[emojiIdx - 1].item;
    //     nextEmoji = currentList[emojiIdx + 1].item;
    //   }

    //   $(".prev-emoji").attr("id", prevEmoji.hexcode);
    //   $(".prev-emoji .icon-img").attr("src", localVariantPath + "/svg/" + prevEmoji.hexcode + ".svg");

    //   $(".next-emoji").attr("id", nextEmoji.hexcode);
    //   $(".next-emoji .icon-img").attr("src", localVariantPath + "/svg/" + nextEmoji.hexcode + ".svg");
    // } else {
    //   $(".prev-emoji").hide();
    //   $(".next-emoji").hide();
    // }
    $(".prev-emoji").hide();
    $(".next-emoji").hide();

    exposeListFilter({
      emoji: hex
    });
    console.log(emojiDetailWrapper);
    emojiDetailWrapper.fadeIn(300);
}

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
}

// function handleRequest(filter) {
//     // open emoji detail view if emoji filter is set else update list
//     if (filter && filter.emoji) {
//       showEmojiDetails(filter.emoji);
//     } else {
//       //updateList(filter);
//     }
//   }

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