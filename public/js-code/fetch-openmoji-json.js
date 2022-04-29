let OPENMOJIJSON = []

getOpenMojiData('/data/openmoji.json.gz')

function getOpenMojiData(url, secondTry = false){
	//console.log('fetch')
	fetch(url).then(function (response) {
		//console.log('data loaded')
		return response.json()
	})
	.then(function (json) {
		//console.log('trigger')
		// Potential bug:
		// It seems sometimes it triggers that the data is loaded, but e.g. the emoji-cloud isn't generated.
		// Maybe it depends whether how files are loaded?
		// It's super random
		// Might be fixed be the additions on top of emoji-cloud.js, emoji-search.js and categories-showcase.js
		OPENMOJIJSON = json;
		$(document).trigger('openmojiJsonLoaded')
	})
	.catch(function(err) {
		console.error('Error loading data from', url)

		// If the gzipped file can't be processed (also happens in localhost)
		if(secondTry === false){
			getOpenMojiData('/data/openmoji.json', true)
		}
	});
}