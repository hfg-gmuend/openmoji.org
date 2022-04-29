let multiColors = {
	'left': null,
	'right': null
}

pickCorrectVariantAccordingToUrl();

function colorChangeSingleColor(skintoneId){	
	$('.circle').removeClass('highlight');

	if(skintoneId === 'black'){
		$('.emoji-variant-color').addClass('hidden')
		$('.emoji-variant-black').removeClass('hidden')
		$('#outline-emoji-preview').addClass('highlight')
		adjustViewAndUrl('black', false);
	}else if(skintoneId === ''){
		$('.emoji-variant-color').removeClass('hidden')
		$('.emoji-variant-black').addClass('hidden')
		$('#color-emoji-preview').addClass('highlight')
		const resultingEmojiHex = SKINTONECOMBINATIONS[skintoneId];
		adjustViewAndUrl(skintoneId, resultingEmojiHex);
	}else{
		$('.emoji-variant-color').removeClass('hidden')
		$('.emoji-variant-black').addClass('hidden')
		$('.skintone-selector > .circle:eq(' + (Number(skintoneId)-1) + ')').addClass('highlight');
		const resultingEmojiHex = SKINTONECOMBINATIONS[skintoneId];
		adjustViewAndUrl(skintoneId, resultingEmojiHex);
	}
}

function colorChangeMultiColor(side, skintoneId){
	multiColors[side] = skintoneId;

	if(!multiColors.left){
		multiColors.left = multiColors.right
	}

	if(!multiColors.right){
		multiColors.right = multiColors.left;
	}

	let skintoneCode = multiColors.left + ',' + multiColors.right;
	if(multiColors.left === multiColors.right){
		skintoneCode = multiColors.left;
	}

	$('.emoji-variant-color').removeClass('hidden')
	$('.emoji-variant-black').addClass('hidden')
	$('.skintone-selector > .circle').removeClass('highlight');
	$('.single-color').removeClass('highlight');
	$('.skintone-selector.left > .circle:eq(' + (multiColors.left-1) + ')').addClass('highlight');
	$('.skintone-selector.right > .circle:eq(' + (multiColors.right-1) + ')').addClass('highlight');

	const resultingEmojiHex = SKINTONECOMBINATIONS[skintoneCode];
	adjustViewAndUrl(skintoneCode, resultingEmojiHex);
}

function adjustViewAndUrl(skintoneId, emojiHex){
	if(skintoneId === ''){
		exposeListFilter({variant: undefined})
	}else if(skintoneId === 'black'){
		exposeListFilter({variant: 'black'})
	}else{
		exposeListFilter({variant: emojiHex})
	}

	if(emojiHex){
		const filePathSVG = getFilePathEmojiImage(emojiHex, 'svg');
		const filePathPNG = getFilePathEmojiImage(emojiHex, 'png');
		const unicodeCombinationLink = getEmojiCombinationLink(emojiHex);
		$('#main-emoji-image-color').attr('src', filePathSVG);
		$('#downloadSVG').attr('href', filePathSVG);
		$('#downloadPNG').attr('href', filePathPNG);
		$('#unicodeCombination').html(unicodeCombinationLink)
	}
}

function getFilePathEmojiImage (hexCode, format = 'svg', blackOrColor = 'color'){
	// This function is a copy from /util/helpers.js
  if(format === 'svg'){
    return '/data/' + blackOrColor + '/svg/' + hexCode + '.svg';
  }else if(format === 'png'){
    return '/php/download_asset.php?type=emoji&emoji_hexcode=' + hexCode + '&emoji_variant=' + blackOrColor;
  }
}

function getEmojiCombinationLink(hexcodeString){
	// This function is a copy from /util/helpers.js
  return hexcodeString.split("-").map(function(hex) {
      if (hex === "200D") return '<a href="https://emojipedia.org/zero-width-joiner/" target="_blank" rel="noreferrer noopener" class="redlink">ZWJ</a>';
      if (hex === "FE0F") return '<a href="https://emojipedia.org/variation-selector-16/" target="_blank" rel="noreferrer noopener" class="redlink">VS16</a>';
      return '<a href="/library/emoji-'+ hex +'" target="_blank" rel="noreferrer noopener" class="redlink">'+ String.fromCodePoint(parseInt(hex, 16)) +'</a>';
  }).join(" • ");
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
    return sPageURL ? sParameters : {};
}

// function getUrlParameters() {
// 	    var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
// 	      sURLVariables = sPageURL.split("&"),
// 	      sParameters = {},
// 	      i;

// 	    for (i = 0; i < sURLVariables.length; i++) {
// 	      var currentParam = sURLVariables[i].split("=");
// 	      sParameters[currentParam[0]] = currentParam[1];
// 	    }
// 	    return sParameters;

// 	    // If variant is present in the URL and the variant actually exists
// 	    if(sParameters.variant && SKINTONESFORHEX[sParameters.variant]){
// 	    	const hexCode = SKINTONESFORHEX[sParameters.variant];
// 	    	const emojiHex = sParameters.variant;
// 	    	const skintoneId = SKINTONESFORHEX[sParameters.variant];
// 	    	//adjustViewAndUrl(skintoneId, emojiHex);
// 	    	//updatePicker(emojiHex);
// 	    }
// }

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

function updatePicker(skintoneId){
	if(skintoneId.split(',').length > 1){
		const skintoneIds = skintoneId.split(',');
		colorChangeMultiColor('left', skintoneIds[0]);
		colorChangeMultiColor('right', skintoneIds[1]);
	}else{
		colorChangeSingleColor(skintoneId)
	}
}

function pickCorrectVariantAccordingToUrl(){
	let urlParameters = getUrlParameters();
	//console.log(urlParameters)
	if(urlParameters.variant){
		let skintoneId = urlParameters.variant
		if(skintoneId !== 'black'){
			skintoneId = SKINTONESFORHEX[urlParameters.variant];
		}
		updatePicker(skintoneId);
	}
}