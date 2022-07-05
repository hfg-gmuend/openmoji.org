const fs = require('fs');
const openMojiJson = require('./public/data/openmoji.json');
const fetch = require('node-fetch');

const limitForTesting = false;

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

const getEmojiDataFor = async(index, emoji) => {
  try{
    const url = 'https://openmoji-emojipedia-api.glitch.me/emojis/' + emoji;
    console.log('  - ' + (index + 1) + '. Get emoji data for', emoji, ' from ', url);
    const response = await fetch(url);
    const body = await response.json();
    if(body?.detail == "Not found."){
      console.log('    - Data received but empty');
      return null;
    }else{
      console.log('    - Success');
    }
    return body;
  }
  catch{
    console.log('    - Fetch failed');
    return null;
  }
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getEmojiPediaDataAndWriteToFile = async () => {
  let emojiPediaData = {}
	const filteredEmojies = getUniqueEmojis();
  console.log('- Emojies to query:', Object.keys(filteredEmojies).length);

  let counter = 0;
	for(let key in filteredEmojies){
		const emojiData = filteredEmojies[key];
		const emoji = emojiData.emoji;
		const response = await getEmojiDataFor(counter, emoji);
    const timeoutToPreventStressingTheAPI = Math.round(Math.random() * 1500);
    console.log('    - Wait for', timeoutToPreventStressingTheAPI ,'ms')
    await delay(timeoutToPreventStressingTheAPI);
    console.log('');
    emojiPediaData[key] = response;
    counter ++
    if(limitForTesting === true && counter > 3){
      break;
    }
	}
  console.log('- Querying done');
  const filePath = './src/data/emojipediaData.json';
  console.log('- Writing data to file', filePath)
  fs.writeFileSync(filePath, JSON.stringify(emojiPediaData, null, 4), 'utf-8');
}

getEmojiPediaDataAndWriteToFile()
