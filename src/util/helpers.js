import openMojiJson from '/public/data/openmoji.json';
import colorPaletteJson from '/public/data/color-palette.json';
import packageJSON from '../../public/data/package.json';

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

const clusterSkintoneVariationsBySkinIdForOneEmoji = (hexcode) => {
  const skintonesData = getSkintoneVariationForEmoji(hexcode);
  let output = {};
  for(let skintoneData of skintonesData.skintones){
    output[String(skintoneData.skintone)] = skintoneData.hexcode;
  }

  for(let skintoneData of skintonesData.skintone_combinations){
    output[String(skintoneData.skintone)] = skintoneData.hexcode;
  }

  return output;
}

const getSkintoneVariationForEmoji = (hexcode) => {
  /* That's really not efficient but since we build the site it's alright */
  const allVariations = getSkintoneVariationsForEachEmoji();
  return allVariations[hexcode] || null;
}

const getSkintoneVariationsForEachEmoji = () => {
  let output = {};

  for(let emoji of openMojiJson){
    // Whether emoji is variant
    if(emoji.skintone_base_hexcode == ''){
      if(!output[emoji.hexcode]){
        output[emoji.hexcode] = {
          baseEmoji: {},
          skintones: [],
          skintone_combinations: []
        }
      }
      output[emoji.hexcode].baseEmoji = emoji;
    }else{
      // Create empty data for this hex code if not existant
      if(!output[emoji.skintone_base_hexcode]){
        output[emoji.skintone_base_hexcode] = {
          skintones: [],
          skintone_combinations: []
        }
      }

      // if multi-skintone -> push to skintones
      if(emoji.skintone_combination === 'single'){
          output[emoji.skintone_base_hexcode].skintones.push(emoji);
      }

      // if multi-skintone -> push to skintone_combinations
      if(emoji.skintone_combination === 'multiple'){
          output[emoji.skintone_base_hexcode].skintone_combinations.push(emoji);
      }
    }
  }

  return output;
}

const getOpenMojiVersion = () => {
  return packageJSON.version;
}

const getNumberOfEmojis = () => {
  return openMojiJson.length;
}

const getNumberOfFlags = () => {
  return parseInt(openMojiJson.filter(function (emoji) {
      return emoji.group == "flags";
    }).length);
}

const getColorForSkinId = (skinId, palette = 'fitzpatrick') => {
  return colorPaletteJson.skintones[palette][parseInt(skinId) - 1];
}

const getColorPaletteSkintones = (palette = 'fitzpatrick') => {
  return colorPaletteJson.skintones[palette];
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
      return '<a href="/library/#emoji='+ hex +'" target="_blank" rel="noreferrer noopener" class="redlink">'+ String.fromCodePoint(parseInt(hex, 16)) +'</a>';
  }).join(" • ");
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getDataForEmoji = (hexcode) => {
  const allEmojis = getAllEmojisByHex();
  return allEmojis[hexcode];
}

const getAllEmojisByHex = () => {
  let emojisByHex = {};
  for(let index in openMojiJson){
    const emojiData = openMojiJson[index];
    emojisByHex[emojiData.hexcode] = emojiData;
  }
  return emojisByHex;
}

const getUniqueEmojis = () => {
  // Filter emojis, so every "unique" emoji is only shown once (not skintones)
  let filteredEmojies = {};
  for(let index in openMojiJson){
    const item = openMojiJson[index];
    // NOTE: skintone_base_emoji needs to occur before skintone variants in list
    if (item.skintone !== "" && item.skintone_combination === "single") {
      if (filteredEmojies[item.skintone_base_hexcode].skintones === undefined){
        filteredEmojies[item.skintone_base_hexcode].skintones = [];
      }
      filteredEmojies[item.skintone_base_hexcode].skintones.push(item);
    } else if(item.skintone !== "" && item.skintone_combination === "multiple") {
      if (filteredEmojies[item.skintone_base_hexcode].skintone_combinations === undefined){
        filteredEmojies[item.skintone_base_hexcode].skintone_combinations = [];
      }
      filteredEmojies[item.skintone_base_hexcode].skintone_combinations.push(item);
    } else {
      filteredEmojies[item.hexcode] = item;
    }
  }
  return filteredEmojies;
}

const getEmojiGroupsAndSubgroups = () => {
  // Extract all groups and subgroups from EmojiData
  let groupsAndSubgroupsObject = {};
  for(let index in openMojiJson){
    const emojiData = openMojiJson[index];
    const group = emojiData.group;
    const subgroup = emojiData.subgroups;
    if(!groupsAndSubgroupsObject[group]){
      groupsAndSubgroupsObject[group] = [];
    }

    if(groupsAndSubgroupsObject[group].indexOf(subgroup) === -1){
      groupsAndSubgroupsObject[group].push(subgroup);
      groupsAndSubgroupsObject[group].sort();
    }
  }

  // Put into array and sort them alphabetically
  let groupsAndSubgroupsArray = [];
  for(let groupName in groupsAndSubgroupsObject){
    groupsAndSubgroupsArray.push({name: groupName, subgroups: groupsAndSubgroupsObject[groupName]});
  }
  groupsAndSubgroupsArray = groupsAndSubgroupsArray.sort((a, b) => a.name.localeCompare(b.name));
  return groupsAndSubgroupsArray;
}

export default {
  getListBasedOnObjectSortedByCertainKey,
  getDataForEmoji,
  getAllEmojisByHex,
  clusterSkintoneVariationsBySkinIdForOneEmoji,
  getSkintoneVariationForEmoji,
  getSkintoneVariationsForEachEmoji,
  getOpenMojiVersion,
  getNumberOfEmojis,
  getNumberOfFlags,
  getColorPaletteSkintones,
  getColorForSkinId,
  getFilePathEmojiImage,
  getEmojiCombinationLink, 
  capitalizeFirstLetter,
  getUniqueEmojis,
  getEmojiGroupsAndSubgroups
}