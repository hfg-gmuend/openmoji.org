import openMojiJson from '/public/data/openmoji.json';

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
  getUniqueEmojis,
  getEmojiGroupsAndSubgroups
}