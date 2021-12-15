import emojipediaJson from '/public/data/emojipediaData.json';

const getDescriptionForAllEmoji = () => {
	return emojipediaJson;
}

export default {
  getDescriptionForAllEmoji,
}