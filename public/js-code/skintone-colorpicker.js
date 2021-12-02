let multiColors = {
	'left': null,
	'right': null
}

function colorChangeSingleColor(skintoneId){	
	const resultingEmojiHex = SKINTONECOMBINATIONS[skintoneId];
	adjustView(resultingEmojiHex);
}

function colorChangeMultiColor(side, skintoneId){
	console.log(side, skintoneId);
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
	const resultingEmojiHex = SKINTONECOMBINATIONS[skintoneCode];
	adjustView(resultingEmojiHex);
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
      return '<a href="/library/#emoji='+ hex +'" target="_blank" rel="noreferrer noopener" class="redlink">'+ String.fromCodePoint(parseInt(hex, 16)) +'</a>';
  }).join(" • ");
}

function adjustView(emojiHex){
	const filePathSVG = getFilePathEmojiImage(emojiHex, 'svg');
	const filePathPNG = getFilePathEmojiImage(emojiHex, 'png');
	const unicodeCombinationLink = getEmojiCombinationLink(emojiHex);
	$('#main-emoji-image').attr('src', filePathSVG);
	$('#downloadSVG').attr('href', filePathSVG);
	$('#downloadPNG').attr('href', filePathPNG);
	$('#unicodeCombination').html(unicodeCombinationLink)
}