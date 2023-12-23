


const getListBasedOnObjectSortedByCertainKey = (object, key, reverse = false) => {
  // From:
  // {
  //  { elem1: {key: Beta}},
  //  { elem2: {key: Alpha}},
  // }

  // To:
  // [elem2, elem1]

  let objectAsArray = [];
  for(let key in object){
    objectAsArray.push([key, object[key]]);
  }

  // Compare as number of string depending on content
  if(isNaN(objectAsArray[0][1][key])){
    objectAsArray.sort((a, b) => String(a[1][key]).localeCompare(String(b[1][key])));
  }else{
    // The if statements make the when the key is null or "", that those results are at the end
    objectAsArray.sort(function(a, b) {
      if(a[1][key] === "" || a[1][key] === null) return 1;
      if(b[1][key] === "" || b[1][key] === null) return -1;
      if(a[1][key] === b[1][key]) return 0;
      return a[1][key] < b[1][key] ? -1 : 1;
    })
  }

  if(reverse === true){
    objectAsArray.reverse();
  }
  let objectKeysOnly = []
  for(let index in objectAsArray){
    objectKeysOnly.push(objectAsArray[index][0])
  }
  return objectKeysOnly;
}

const getFilePathEmojiImage = (hexCode, format = 'svg', blackOrColor = 'color') => {
  if(format === 'svg'){
    return '/data/' + blackOrColor + '/svg/' + hexCode + '.svg';
  }else if(format === 'png'){
    return '/php/download_asset.php?type=emoji&emoji_hexcode=' + hexCode + '&emoji_variant=' + blackOrColor;
  }
}

const getEmojiCombinationLink = (hexcodeString) => {
  return hexcodeString.split("-").map(function(hex) {
      if (hex === "200D") return '<a href="https://emojipedia.org/zero-width-joiner/" target="_blank" rel="noreferrer noopener" class="redlink">ZWJ</a>';
      if (hex === "FE0F") return '<a href="https://emojipedia.org/variation-selector-16/" target="_blank" rel="noreferrer noopener" class="redlink">VS16</a>';
      return '<a href="/library/emoji-'+ hex +'" target="_blank" rel="noreferrer noopener" class="redlink">'+ String.fromCodePoint(parseInt(hex, 16)) +'</a>';
  }).join(" • ");
}

const getEmojiCombinationString = (hexcodeString) => {
  return hexcodeString.split("-").map(function(hex) {
      return String.fromCodePoint(parseInt(hex, 16));
  }).join("");
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default {
  getListBasedOnObjectSortedByCertainKey,
  getFilePathEmojiImage,
  getEmojiCombinationLink,
  getEmojiCombinationString,
  capitalizeFirstLetter,
};
