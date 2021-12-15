import openMojiJson from '/public/data/openmoji.json';
import packageJSON from '../../public/data/package.json';

console.log('---> loading openMojiJsonUtil');

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

const clusterSkintoneVariationsBySkinIdForAllEmojis = (uniqueEmojis) => {
  let output = {}
  const skinToneVariations = getSkintoneVariationsForEachEmoji();
  for(let hex in uniqueEmojis){
    let cluster = {};
    const skintonesData = skinToneVariations[hex];
    for(let skintoneData of skintonesData.skintones){
      cluster[String(skintoneData.skintone)] = skintoneData.hexcode;
    }

    for(let skintoneData of skintonesData.skintone_combinations){
      cluster[String(skintoneData.skintone)] = skintoneData.hexcode;
    }
    output[hex] = cluster;
  }
  return output;
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

const getNumberOfFlags = () => {
  return parseInt(openMojiJson.filter(function (emoji) {
      return emoji.group == "flags";
    }).length);
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
  getEmojiGroupsAndSubgroups,
  getUniqueEmojis,
  getDataForEmoji,
  getAllEmojisByHex,
  clusterSkintoneVariationsBySkinIdForOneEmoji,
  clusterSkintoneVariationsBySkinIdForAllEmojis,
  getSkintoneVariationForEmoji,
  getSkintoneVariationsForEachEmoji,
  getOpenMojiVersion,
  getNumberOfEmojis,
  getNumberOfFlags,
}