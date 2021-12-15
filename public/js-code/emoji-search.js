$(document).ready(function () {
	let fuse, searchTermBefore, searchDom, searchBarDom, searchResultsDom, searchResultsListDom;
	const classNameForHidingSearchBar = 'hidden';
	const classNameSearchResultSelected = 'itemSelected';
	const classNameSearchResultNotSelected = 'itemNotSelected';
	init();
	checkUrlParametersAndSearchIfNecessary();

	function checkUrlParametersAndSearchIfNecessary(){
		let urlParameters = getUrlParameters();
		if(urlParameters && urlParameters.search && urlParameters.search !== ''){
			const searchTerm = urlParameters.search;
			searchForTerm(searchTerm);
		}
	}

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

	function clearSearch(){
		exposeListFilter({search: undefined});
		$('.emoji_single').removeClass('hiddenDueToSearch');
		$('#sortFunctionBestMatch').addClass('hidden');
		$('#sortName').html( $('#sortFunctionUnicode').text() );
		$(searchBarDom).val('');
		$(searchBarDom).blur();
	}

	function searchForTerm(searchTerm){
		exposeListFilter({search: searchTerm});
		let results = fuse.search(searchTerm)
		$(searchBarDom).val(searchTerm)
		$(searchBarDom).blur();
		$('.emoji_single').addClass('hiddenDueToSearch');
		$('#sortFunctionBestMatch').removeClass('hidden');
		$('#sortName').html( $('#sortFunctionBestMatch').text() );
		
		for(let index in results){
			const result = results[index];
			const element = $('#emoji-' + result.item.hexcode)
			element.data('order-bestmatch', index + 1);
			element.css('order', index + 1);
			element.removeClass('hiddenDueToSearch');
		}
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
	    return sPageURL ? sParameters : undefined;
	  }

	function init(){
		searchTermBefore = undefined;

		const fuseOptions = {
		  includeScore: true,
		  keys: ['emoji', 'hexcode', 'group', 'subgroups', 'annotation', 'tags', 'openmoji_tags'],
		  threshold: 0.4
		}
		fuse = new Fuse(OPENMOJIJSON, fuseOptions);

		searchDom = document.getElementById('search-element');
		searchBarDom = document.getElementById('emojisearch');
		searchResultsDom = document.getElementById('search-results-wrapper');
		searchResultsListDom = document.getElementById('search-results');

		addListeners();
	}

	function updateResultsDom(results, searchTerm){
		if(results.length === 0){ // No search results
			const dom = '<div class="noResults">No results for ' + searchTerm + '</div>';
			searchResultsListDom.innerHTML = dom;
		}else{
			let dom = ''
			for(let index in results){
				const result = results[index];
				const item = result.item;
				const linkUrl = '/library/emoji-' + item.hexcode;
				const linkText = item.annotation
				dom += '<li>'
				dom += '   <a class="searchResult ' + classNameSearchResultNotSelected + '" href="' + linkUrl + '">'
				dom += '      <img src="/data/color/svg/' + item.hexcode + '.svg" alt=""/>'
				dom += '      <span>' + linkText + '</span>'
				dom += '   </a>'
				dom += '</li>'
			}
			searchResultsListDom.innerHTML = dom;
		}
	}

	function addListeners(){
		searchBarDom.addEventListener('focus', checkResults)
		searchBarDom.addEventListener('keyup', checkResults)
		document.addEventListener('click', closePopupIfClickOutSidePopup)
		document.addEventListener('keydown', monitorKeyEventsDown)
		document.addEventListener('keyup', monitorKeyEventsUp)
	}

	function focusSearchBar(){
		searchBarDom.focus();
	}

	function areSearchResultsShown(){
		if(searchResultsDom.classList.contains(classNameForHidingSearchBar) === true){
			return false
		}
		return true;
	}

	function monitorKeyEventsUp(e) {
		if(isFocusWithinSearchBarOrResults() === false){
			// This detects tabbing "out" of the search and closes	
			hideSearchResults();
		}
	}

	function monitorKeyEventsDown(e) {
		let resultsShown = areSearchResultsShown()
		switch(e.keyCode) { 
			case 38: // "up" arrow
				if(resultsShown === true){
					navigateInList('up');
					e.preventDefault();
				}
				break;
			
			case 40: // "down" arrow
				if(resultsShown === true){
					navigateInList('down');
					e.preventDefault();
				}
				break;

			case 13: // Enter button
				const currentlySelected = getIndexOfCurrentlyFocussedSearchResult();
				// If no item is selected (i.e. search bar selected) then clicking enter trigger the search for the string
				if(currentlySelected === false){
					const searchTerm = searchBarDom.value.trim();
					if(searchTerm === '' || resultsShown === false){
						clearSearch()
					}else{
						// An ugly check whether the search list is present and whether the url should change or search in place
						if( $('#emoji_grid').length ){
							searchForTerm(searchTerm);
						}else{
							window.location.href = '/library/#search=' + searchTerm;
						}
					}
				}
				break;
		}
	}

	function isFocusWithinSearchBarOrResults(){
		return searchDom.contains(document.activeElement)
	}

	function closePopupIfClickOutSidePopup(){
		const withinBoundaries = event.composedPath().includes(searchDom)
	  	if (!withinBoundaries) {
	    	hideSearchResults();
	  	}
	}

	function navigateInList(direction) {
		const currentlySelected = getIndexOfCurrentlyFocussedSearchResult();
		removeArtificalHighlightOfFirstSearchResult();
		// If no list item is selected (i.e. input field selected) and pressed down, select the first item
		if(direction === 'down' && currentlySelected === false){
			focusOnSearchItemWithIndex(0);
		}else{
			if(direction === 'up') {
				if(currentlySelected === 0){
					focusSearchBar();
					moveCursorToEnd(searchBarDom);
				}else{
					focusOnSearchItemWithIndex(currentlySelected - 1);
				}
			}else if(direction === 'down'){
				const numberOfShownResults = searchResultsListDom.children.length;
				if(currentlySelected < numberOfShownResults - 1){
					focusOnSearchItemWithIndex(currentlySelected + 1);	
				}
			}
		}
	}

	function removeArtificalHighlightOfFirstSearchResult(){
		const firstChild = searchResultsListDom.children[0];
		const link = firstChild.children[0];
		link.classList.add(classNameSearchResultNotSelected)
		link.classList.remove(classNameSearchResultSelected)
	}

	function getIndexOfCurrentlyFocussedSearchResult(){
		let currentlySelected = false;
		for (var i = 0; i < searchResultsListDom.children.length; i++) {
			const child = searchResultsListDom.children[i];
			const link = child.children[0];

			if(document.activeElement === link){
				currentlySelected = i;
				break;
			}
		}
		return currentlySelected;
	}

	function moveCursorToEnd(el) {
	   setTimeout(function() {
	    el.setSelectionRange(9999, 9999);
	  }, 1);
	}

	function focusOnSearchItemWithIndex(menuitemIndex, click = false) {
		const listItems = searchResultsListDom.children;
		const listItem = listItems[menuitemIndex];
		const link = listItem.children[0];
		setTimeout(function(){
			link.focus();
			if(click === true){
				link.click();
			}	
		}, 1)
	}

	function hideSearchResults(){
		searchResultsDom.classList.add(classNameForHidingSearchBar)
	}

	function showSearchResults(){
		searchResultsDom.classList.remove(classNameForHidingSearchBar)
	}

	function checkResults(){
		const searchTerm = searchBarDom.value.trim();

		if(searchTerm !== ''){
			showSearchResults();
		}

		if(searchTerm !== searchTermBefore){
			const results = fuse.search(searchTerm).slice(0, 10);
			if(searchTerm === ''){
				hideSearchResults();
			}else{
				showSearchResults();
				updateResultsDom(results, searchTerm);
			}
		}

		searchTermBefore = searchTerm;
	}
})