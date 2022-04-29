let OPENMOJIJSON = []

getOpenMojiData('/data/openmoji.json.gz')

function getOpenMojiData(url){
	//console.log('fetch')
	fetch(url).then(function (response) {
		return response.json()
	})
	.then(function (json) {
		OPENMOJIJSON = json;
		$(document).trigger('openmojiJsonLoaded')
	})
	.catch(function(err) {
		console.error('Error loading data from', url)

		// If the gzipped file can't be processed (also happens in localhost)
		getOpenMojiData('/data/openmoji.json')
	});
}