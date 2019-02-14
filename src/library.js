$(document).ready(function() {
	//------------ Initialization ------------
	$( "#emoji-detail-wrapper .popover-wrapper" ).css("display", "flex").hide();
	$( "#sort-selector .sort_selector__selected" ).text($( "#sort-selector .sort_selector__list .active" ).text());

	//------------ for emoji list ------------
	var EMOJI_LIST;
	var LIST_FILTERS;
	var currentList;
	var fuse;
	const FUSE_DEFAULT_THRESHOLD = 0.1;
	const sortFuncs = {    // list of possible sort functions NOTE: functions need to sort in ascending order
		"unicode": function(a, b) {
			return parseInt(a.item.order) - parseInt(b.item.order);
		},
		"alphabetical": function(a, b) {
			return a.item.annotation.localeCompare(b.item.annotation);
		},
		"contribution_date": function(a, b) {
			return new Date(b.item.openmoji_date) - new Date(a.item.openmoji_date);
		},
		"best_match": function(a, b) {
			return a.item.score - b.item.score;
		}
	};

	// for list sort
	const INITIAL_SORT = $( "#sort-selector .sort_selector__list .active" ).data( "sortfunc" );
	var currentSort    = INITIAL_SORT;
	var prevSort       = currentSort;
	var currentSortDir = getSortDir();

	var currentLazyInstance;

	$.when(
		$.getJSON( "data/openmoji.json" , function(json) {
			EMOJI_LIST = json.map((item) => {
				// add group path for filtering with fusejs
				item.groupPath = getGroupPath(item.group, item.subgroups);

				// wrap item inside item key so structure matches with fusejs search
				item.item = item;

				return item;
			});
		}),
		$.getJSON( "data/filterWeights.json" , function(json) {
			LIST_FILTERS = json;
		})
	).then(function() {
		// generate nav-bar
		generateNav();

		// init fuse object
		fuse = new Fuse(EMOJI_LIST, { shouldSort: true,
										tokenize: true,
										includeScore: true,
										threshold: FUSE_DEFAULT_THRESHOLD,
										location: 0,
										distance: 100,
										maxPatternLength: 32,
										minMatchCharLength: 0 });

		// init currentlist to all emojis
		currentList = EMOJI_LIST;

		// handle possible filters in URL
		handleRequest(getUrlParameters());
	});

	// function to update emoji list filtered by search
	function updateList(filter) {
		var fuseSearchStr = "";

		// check which filters are set to set fuse keys weighting accordingly
		if(filter === undefined || filter.group === "all OpenMojis" && Object.keys(filter).length < 2) {
			fuseSearchStr = "all OpenMojis";
			if(filter === undefined) {
				filter = {};
				filter.group = "all OpenMojis";
			}
			currentList = EMOJI_LIST;
		} else {
			// if only one filter is set and it is not equal to search make sharp search
			if(Object.keys(filter).length == 1 && !filter.search) {
				fuse.options.threshold = 0.0;
				fuse.options.tokenize = false;
			} else {
				fuse.options.threshold = FUSE_DEFAULT_THRESHOLD;
				fuse.options.tokenize = true;
			}

			// set fuse keys according to filter and weighted according to the URL order
			fuse.options.keys = [];
			var weight = 1;
			for(var key in filter) {
				if(filter.hasOwnProperty(key)) {
					var matchingFuseKeys = Object.keys(LIST_FILTERS).filter(function(fKey) {
						return fKey.includes(key);
					});

					if(matchingFuseKeys.length > 0) {
						matchingFuseKeys.forEach(function(mKey) {
							fuse.options.keys.push( {name: mKey, weight: weight} );
						});

						weight -= 0.1;
					}
				}
			}

			// if filter "search" also add all other keys with percental weighting
			if(filter.search) {
				for(var key in LIST_FILTERS) {
					if(LIST_FILTERS.hasOwnProperty(key)) {
						if(fuse.options.keys.filter( fKey => fKey.name === key ).length == 0) {
							fuse.options.keys.push( {name: key, weight: Math.round(weight * LIST_FILTERS[key] * 1e2) / 1e2} );
						}
					}
				}
			}

			// generate fuseSearchStr based on filter entries
			Object.values(filter).forEach(function(currFilter, idx) {
				if(idx == 0) {
					fuseSearchStr += currFilter;
				} else {
					fuseSearchStr += " " + currFilter;
				}
			});

			// filter list with fuse based on searchStr
			currentList = fuse.search(fuseSearchStr);
		}

		// mark nav-item if filter group is set
		if(filter && filter.group) {
			markNavItem(filter.group);
		} else {
			markNavItem(undefined);
		}

		// set search input field value to search filter if it is defined and sort by "best match"
		if(filter && filter.search) {
			updateSortSelector("best_match");

			$( ".search" ).val(filter.search);
		} else if($( ".search" ).val().length > 0 || prevSort === "best_match") {
			updateSortSelector(INITIAL_SORT);

			$( ".search" ).val("");
		}

		// show fuseSearchStr in HTML
		if(filter && Object.keys(filter).length == 1 && filter.author) fuseSearchStr = "Author: " + fuseSearchStr;
		$( "#selected-category" ).text(fuseSearchStr);

		// generate list
		generateEmojiList();
	}

	// update sort selector
	function updateSortSelector(newSortFunc) {
		// if sort function is defined and isn't the same as the current one set new sort function
		if(sortFuncs[newSortFunc] !== undefined && newSortFunc !== currentSort) {
			prevSort    = currentSort;
			currentSort = newSortFunc;

			// get according nodes
			var activeSortEl = $( "#sort-selector .sort_selector__list .active" );
			var targetSortEl = $( "#sort-selector .sort_selector__list [data-sortfunc=" + currentSort + "]" );

			// if active sort element is normally hidden hide it
			if(activeSortEl.data("normally_hidden") === true) activeSortEl.removeClass("visible").addClass("hidden");

			// mark to new sort function corresponding element as active
			$( "#sort-selector .sort_selector__list .active" ).removeClass("active");
			targetSortEl.addClass("active");

			// if current sort element is hidden show it and mark it as normally hidden
			if(targetSortEl.hasClass("hidden")) {
				targetSortEl.removeClass("hidden").addClass("active");
				targetSortEl.attr("data-normally_hidden", true);
			}

			// show current sort
			$( "#sort-selector .sort_selector__selected" ).text(targetSortEl.text());
		}
	}

	// returns sort direction (asc or desc) based on sort selector classes
	function getSortDir() {
		var sortSelector = $( "#sort-selector" );
		if(sortSelector.hasClass( "sort_selector--asc" )) {
			return "asc";
		} else if(sortSelector.hasClass( "sort_selector--desc" )) {
			return "desc";
		} else {
			return currentSortDir;
		}
	}

	// generates groupPath string from passed group and subgroups
	function getGroupPath(group, subgroups) {
		return group + "/" + ($.isArray(subgroups) ? subgroups.join(" ") : subgroups);
	}

	// sorts currentList (default: ascending order) and generates emoji list
	function generateEmojiList() {
		// empty list
		$( ".emoji_grid" ).empty();

		$( "html" ).scrollTop(0);

		// sort list if sort has changed or flip list if sort direction changed
		if(currentSort !== prevSort) {
			prevSort = currentSort;
			currentList.sort(sortFuncs[currentSort]);

			// flip list if sort has to be in descending order
			if(getSortDir() === "desc") {
				currentList.reverse();
			}
		} else if(getSortDir() !== currentSortDir) {
			currentSortDir = getSortDir();
			currentList.reverse();
		}

		// check if show color is selected and add emojis accordingly
		if($( "#show-color .switch input[type=checkbox]" ).is(":checked")) {
			for(var i = 0; i < currentList.length; i++) {
				var currEmoji = currentList[i].item;
				$( ".emoji_grid" ).append("<div class='emoji_single' id='" + currEmoji.hexcode + "'><div class = 'emoji-container'><img class='lazy' data-src='data/color/svg/" + currEmoji.hexcode + ".svg'></div><div><h3>" + currEmoji.annotation + "</h3><p>" + currEmoji.hexcode + "</p></div></div>");
			}
		} else {
			for(var i = 0; i < currentList.length; i++) {
				var currEmoji = currentList[i].item;
				$( ".emoji_grid" ).append("<div class='emoji_single' id='" + currEmoji.hexcode + "'><div class = 'emoji-container'><img class='lazy' data-src='data/black/svg/" + currEmoji.hexcode + ".svg'></div><div><h3>" + currEmoji.annotation + "</h3><p>" + currEmoji.hexcode + "</p></div></div>");
			}
		}

		// init/refresh lazy loading
		if(currentLazyInstance !== undefined) currentLazyInstance.destroy();

		currentLazyInstance = $(".lazy").Lazy({
			appendScroll: "#library-content",
			chainable: false
		});
	}

	//------------ URL List filter exposing ------------
	function exposeListFilter(filter) {
		// add filter that already exist in URL to current filter, so they don't get lost
		var currentUrlParams = getUrlParameters();
		// if currentUrlParams are undefined create new object
		if(currentUrlParams === undefined) currentUrlParams = {};

		// remove undefined filters and add new filter to currentUrlParams or update exisiting ones
		for(var key in filter) {
			if(filter.hasOwnProperty(key)) {
				if(filter[key] === undefined) {
					// also delete in currentUrlParams if it exists there
					if(currentUrlParams.hasOwnProperty(key)) {
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
		if($.isEmptyObject(currentUrlParams)) {
			URL = window.location.href.substring(0, window.location.href.indexOf("#"));
		} else if(window.location.href.includes("#")) {
			URL = window.location.href.substring(0, window.location.href.indexOf("#") + 1);
		} else {
			URL = window.location.href.substring(0, window.location.href.indexOf("#")) + "#";
		}
		history.pushState(null, "", URL + $.param(currentUrlParams));

		handleRequest(getUrlParameters());
	}

	function getUrlParameters() {
		var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
			sURLVariables = sPageURL.split("&"),
			sParameters = {},
			i;

		for(i = 0; i < sURLVariables.length; i++) {
			var currentParam = sURLVariables[i].split("=");
			sParameters[currentParam[0]] = currentParam[1];
		}

		return sPageURL ? sParameters : undefined;
	}

	function handleRequest(filter) {
		// open emoji detail view if emoji filter is set else update list
		if(filter && filter.emoji) {
			showEmojiDetails(filter.emoji);
		} else {
			updateList(filter);
		}
	}


	//------------ nav ------------
	function generateNav() {
		var navItems = [];
		var groups = [];

		EMOJI_LIST.forEach(function(openmoji) {
			openmoji = openmoji.item;

			if(!groups.includes(openmoji.group)) {
				groups.push(openmoji.group);

				// get all emojis with specified group
				var filteredByGroup = EMOJI_LIST.filter(function(emoji) {
					return emoji.group == openmoji.group;
				});

				// get all subgroups
				var subgroups = [];
				filteredByGroup.forEach(function(emoji) {
					if(subgroups.indexOf(emoji.subgroups) == -1) {
						subgroups.push(emoji.subgroups);
					}
				});

				// add nav item object to navItems
				navItems.push( {"group": openmoji.group, "subgroups": subgroups} );
			}
		});

		// populate html with navItems
		navItems.forEach(function(item) {
			// add group
			var html = item.subgroups.length > 0 ? "<li class='mainmenu' data-item='" + item.group + "'>" : "<li data-item='" + item.group + "'>";
				html += "<input id=" + item.group + " type='radio' name='category' value=" + item.group + ">"
					 + "<label for=" + item.group + " data-grouppath=" + item.group + ">" + item.group + "</label>"
					 + "<ul class='submenu'>";

			// add subgroups
			item.subgroups.forEach(function(subgroup) {
				var groupPath = getGroupPath(item.group, subgroup);

				html += "<li data-item='" + groupPath + "'>"
					 + "<input id=" + subgroup + " type='radio' name='category' value=" + subgroup + ">"
					 + "<label for=" + subgroup + " data-grouppath='" + groupPath + "'>" + subgroup + "</label>"
					 + "</li>";
			});

			html += "</ul></li>";
			// add new nav item in html
			$( "#nav-items" ).append(html);
		});
	}


	//------------ Emoji detail view ------------
	function showEmojiDetails(id) {
		var path;
		if($( "#show-color .switch input[type=checkbox]" ).is(":checked")) {
			// highlight colored emoji
			$( "#outline-emoji-preview" ).removeClass("highlight");
			$( "#color-emoji-preview" ).addClass("highlight");

			path = "data/color";
		} else {
			// highlight outline emoji
			$( "#color-emoji-preview" ).removeClass("highlight");
			$( "#outline-emoji-preview" ).addClass("highlight");

			path = "data/black";
		}

		// get in index of current object
		var currEmoji;
		var index = currentList.findIndex(function(el) {
			el = el.item;

			if(el.emoji === id || el.hexcode === id) {
				currEmoji = el;
				return true;
			}
		});

		// update images
		$( "#main-emoji-image" ).attr("src", path + "/svg/" + currEmoji.hexcode + ".svg");
		$( "#outline-emoji-image-preview" ).attr("src", "data/black/svg/" + currEmoji.hexcode + ".svg");
		$( "#color-emoji-image-preview" ).attr("src", "data/color/svg/" + currEmoji.hexcode + ".svg");
		// update description
		$( "#description h2" ).text(currEmoji.annotation);
		$( "#description #unicode" ).text(currEmoji.hexcode).attr("href", "http://www.decodeunicode.org/en/u+" + currEmoji.hexcode);
		$( "#description #author" ).text(currEmoji.openmoji_author);
		$( "#description #category" ).text(currEmoji.group);
		$( "#description #subcategory" ).text(currEmoji.subgroups);
		// update path
		$( "#description .path a:nth-child(2)" ).text(currEmoji.group);
		$( "#description .path a:nth-child(3)" ).text(currEmoji.subgroups);
		// update download links
		$( "#svg-download-btn" ).attr("href", path + "/svg/" + currEmoji.hexcode + ".svg");
		$( "#png-download-btn" ).attr("href", path + "/618x618/" + currEmoji.hexcode + ".png");

		// update prev and next
		if(currentList.length > 1) {
			$( ".prev-emoji" ).show();
			$( ".next-emoji" ).show();

			// set prev and next emoji id
			var prevEmoji;
			var nextEmoji;
			if(index == 0) {
				prevEmoji = currentList[currentList.length - 1].item;
				nextEmoji = currentList[index + 1].item;
			} else if (index == currentList.length - 1) {
				nextEmoji = currentList[0].item;
				prevEmoji = currentList[index - 1].item;
			} else {
				prevEmoji = currentList[index - 1].item;
				nextEmoji = currentList[index + 1].item;
			}

			$( ".prev-emoji" ).attr("id", prevEmoji.hexcode);
			$( ".prev-emoji .icon-img" ).attr("src", path + "/svg/" + prevEmoji.hexcode + ".svg");

			$( ".next-emoji" ).attr("id", nextEmoji.hexcode);
			$( ".next-emoji .icon-img" ).attr("src", path + "/svg/" + nextEmoji.hexcode + ".svg");
		} else {
			$( ".prev-emoji" ).hide();
			$( ".next-emoji" ).hide();
		}

		$( "#emoji-detail-wrapper .popover-wrapper" ).fadeIn(300);
	}


	//------------ Event listeners ------------
	// nav selection change listener to update EMOJI_LIST based on clicked (sub-)category
	$( "#library-wrapper" ).on("click", "#nav-items li label, #category, #subcategory, #description .path a*", function(e) {
		e.preventDefault();

		if($( this ).parent().hasClass("mainmenu")) navItemGotClicked = true;

		// hide popover wrapper if it is shown
		if($( "#emoji-detail-wrapper .popover-wrapper" ).is(":visible")) {
			$( "#emoji-detail-wrapper .popover-wrapper" ).fadeOut(400);
		}

		exposeListFilter( {group: $( this ).data( "grouppath" ), search: undefined, author: undefined, emoji: undefined} );
	});

	// "show color" radio button change listener to change EMOJI_LIST from black to color or vice versa
	$( "#show-color .switch input[type=checkbox]" ).change(function() {
		updateList( getUrlParameters() );
	});

	// search field listener to update EMOJI_LIST based on search text when enter is pressed
	$( ".search" ).keydown(function(e) {
		if (e.which == 13) {
			$( this ).val().length > 0 ? exposeListFilter( {search: $( this ).val(), group: undefined, author: undefined, emoji: undefined} ) : exposeListFilter( {search: undefined} );
		}
	});

	// click on emoji in list or move through emojis in detail view
	$( "#library-wrapper" ).on("click", ".emoji_single, .prev-emoji, .next-emoji", function() {
		exposeListFilter( {emoji: $( this ).attr("id")} );
	});

	// toggle outline and color in emoji detail view
	$( "#emoji-detail-wrapper .popover .emoji-preview-image" ).click(function() {
		// toggle "show color" checkbox
		if($( this ).is($( "#color-emoji-image-preview" ))) {
			$( "#show-color .switch input[type=checkbox]" ).prop("checked", true);
		} else if($( this ).is($( "#outline-emoji-image-preview" ))) {
			$( "#show-color .switch input[type=checkbox]" ).prop("checked", false);
		}

		// update emoji detail view
		showEmojiDetails(getUrlParameters().emoji);
	});

	// author click listener to filter emoji list by author
	$( "#author" ).click(function(e) {
		e.preventDefault();

		exposeListFilter( {author: $( this ).text(), search: undefined, group: undefined, emoji: undefined} );
		$( "#emoji-detail-wrapper .popover-wrapper" ).fadeOut(400);
	});

	// close overlay
	$( "#close-detailview" ).click(function() {
		exposeListFilter( {emoji: undefined} );
		$( "#emoji-detail-wrapper .popover-wrapper" ).fadeOut(400);
	});

	// sort toggle
	$( "#sort-selector .sort_selector__list a" ).click(function(e) {
		e.preventDefault();

		// fetch according sort function and update sort selector
		updateSortSelector($( e.currentTarget ).data( "sortfunc" ));

		// refresh emoji list
		if(prevSort !== currentSort) generateEmojiList();
	});

	// sort direction toggle
	$( "#sort-selector .sort_selector__selected" ).click(function(e) {
		// toggle current sort direction
		var sortSelector = $( "#sort-selector" );

		if(getSortDir() === "asc") {
			sortSelector.removeClass( "sort_selector--asc" );
			sortSelector.addClass( "sort_selector--desc" );
		} else if(getSortDir() === "desc") {
			sortSelector.removeClass( "sort_selector--desc" );
			sortSelector.addClass( "sort_selector--asc" );
		}

		// regenerate emoji list
		generateEmojiList();
	});
});
