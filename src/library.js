$(document).ready(function() {
	//------------ Initialization ------------
	$( "#popover-wrapper" ).css("display", "flex").hide();

	//------------ for emoji list ------------
	var EMOJI_LIST;
	var LIST_FILTERS;
	var currentList;
	var fuse;
	const FUSE_DEFAULT_THRESHOLD = 0.1;

	$.when(
		$.getJSON( "data/openmoji.json" , function(json) {
			EMOJI_LIST = json;
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
										includeScore: false,
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
		// empty list
		$( ".emoji_grid" ).empty();

		$( "html" ).scrollTop(0);

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
			} else {
				fuse.options.threshold = FUSE_DEFAULT_THRESHOLD;
			}

			// set fuse keys according to filter and weighted according to the URL order
			fuse.options.keys = [];
			var weight = 1;
			for(var key in filter) {
				if(filter.hasOwnProperty(key)) {
					var matchingFuseKeys = Object.keys(LIST_FILTERS).filter(function(fKey) {
						return fKey.includes(key);
					});
					matchingFuseKeys.forEach(function(mKey) {
						fuse.options.keys.push( {name: mKey, weight: weight} );
					});

					weight -= 0.1;
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

			// set search input field value to search filter if it is defined
			filter.search ? $( ".search" ).val(filter.search) : $( ".search" ).val("");
		}

		// mark nav-item if filter group is set
		if(filter && filter.group) {
			markNavItem(filter.group);
		} else {
			markNavItem(undefined);
		}

		// show fuseSearchStr in HTML
		$( "#selected-category" ).text(fuseSearchStr);

		// check if show color is selected and add emojis accordingly
		if($( "#show-color .switch input[type=checkbox]" ).is(":checked")) {
			for(var i = 0; i < currentList.length; i++) {
				$( ".emoji_grid" ).append("<div class='emoji_single' id='" + currentList[i].hexcode + "'><div class = 'emoji-container'><img src='data/color/svg/" + currentList[i].hexcode + ".svg'></div><div><h3>" + currentList[i].annotation + "</h3><p>" + currentList[i].hexcode + "</p></div></div>");
			}
		} else {
			for(var i = 0; i < currentList.length; i++) {
				$( ".emoji_grid" ).append("<div class='emoji_single' id='" + currentList[i].hexcode + "'><div class = 'emoji-container'><img src='data/black/svg/" + currentList[i].hexcode + ".svg'></div><div><h3>" + currentList[i].annotation + "</h3><p>" + currentList[i].hexcode + "</p></div></div>");
			}
		}
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
			URL = window.location.href.substring(0, window.location.href.indexOf("?"));
		} else if(window.location.href.includes("?")) {
			URL = window.location.href.substring(0, window.location.href.indexOf("?") + 1);
		} else {
			URL = window.location.href.substring(0, window.location.href.indexOf("?")) + "?";
		}
		history.pushState(null, "", URL + $.param(currentUrlParams));

		handleRequest(getUrlParameters());
	}

	function getUrlParameters() {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
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
			if(filter.group === undefined) updateList(undefined);
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
			if(!groups.includes(openmoji.group)) {
				groups.push(openmoji.group);

				// get all emojis with specified group
				var filteredByGroup = EMOJI_LIST.filter(function(emoji) {
					return emoji.group == openmoji.group;
				});

				// get all subgroups
				var subgroups = [];
				filteredByGroup.forEach(function(emoji) {
					/*emoji.subgroups.forEach(function(subgroup) {
						if(subgroups.indexOf(subgroup) == -1) {

						}
					});*/
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
					 + "<label for=" + item.group + ">" + item.group + "</label>"
					 + "<ul class='submenu'>";

			// add subgroups
			item.subgroups.forEach(function(subgroup) {
				html += "<li data-item='" + subgroup + "'>"
					 + "<input id=" + subgroup + " type='radio' name='category' value=" + subgroup + ">"
					 + "<label for=" + subgroup + ">" + subgroup + "</label>"
					 + "</li>";
			});

			html += "</ul></li>";
			// add new nav item in html
			$( "#nav-items" ).append(html);
		});
	}


	//------------ Emoji detail view ------------
	function showEmojiDetails(id) {
		var currEmoji = currentList.filter(function(item) {
			return item.emoji == id || item.hexcode == id;
		});

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
		var index = currentList.indexOf(currEmoji[0]);
		// update images
		$( "#main-emoji-image" ).attr("src", path + "/svg/" + currEmoji[0].hexcode + ".svg");
		$( "#outline-emoji-image-preview" ).attr("src", "data/black/svg/" + currEmoji[0].hexcode + ".svg");
		$( "#color-emoji-image-preview" ).attr("src", "data/color/svg/" + currEmoji[0].hexcode + ".svg");
		// update description
		$( "#description h2" ).text(currEmoji[0].annotation);
		$( "#description #unicode" ).text(currEmoji[0].hexcode);
		$( "#description #author" ).text(currEmoji[0].hfg_author);
		$( "#description #category" ).text(currEmoji[0].group);
		$( "#description #subcategory" ).text(currEmoji[0].subgroups);
		// update path
		$( "#description .path a:nth-child(2)" ).text(currEmoji[0].group);
		$( "#description .path a:nth-child(3)" ).text(currEmoji[0].subgroups);
		// update download links
		$( "#svg-download-btn" ).attr("href", path + "/svg/" + currEmoji[0].hexcode + ".svg");
		$( "#png-download-btn" ).attr("href", path + "/70x70/" + currEmoji[0].hexcode + ".png");

		// update prev and next
		if(currentList.length > 1) {
			$( ".prev-emoji" ).show();
			$( ".next-emoji" ).show();

			// set prev and next emoji id
			var prevEmoji = currentList[index - 1];
			var nextEmoji = currentList[index + 1];

			if(index == 0) {
				prevEmoji = currentList[currentList.length - 1];
			} else if (index == currentList.length - 1) {
				nextEmoji = currentList[0];
			}

			$( ".prev-emoji" ).attr("id", prevEmoji.hexcode);
			$( ".prev-emoji .icon-img" ).attr("src", path + "/svg/" + prevEmoji.hexcode + ".svg");

			$( ".next-emoji" ).attr("id", nextEmoji.hexcode);
			$( ".next-emoji .icon-img" ).attr("src", path + "/svg/" + nextEmoji.hexcode + ".svg");
		} else {
			$( ".prev-emoji" ).hide();
			$( ".next-emoji" ).hide();
		}

		$( "#popover-wrapper" ).fadeIn(300);
	}


	//------------ Event listeners ------------
	// nav selection change listener to update EMOJI_LIST based on clicked (sub-)category
	$( "#library-wrapper" ).on("click", "#nav-items li label, #category, #subcategory, #description .path a*", function(e) {
		e.preventDefault();

		if($( this ).parent().hasClass("mainmenu")) navItemGotClicked = true;

		// hide popover wrapper if it is shown
		if($( "#popover-wrapper" ).is(":visible")) {
			$( "#popover-wrapper" ).fadeOut(400);
		}

		exposeListFilter( {group: $( this ).text(), search: undefined, author: undefined, emoji: undefined} );
	});

	// "show color" radio button change listener to change EMOJI_LIST from black to color or vice versa
	$( "#show-color .switch input[type=checkbox]" ).change(function() {
		updateList( getUrlParameters() );
	});

	// search field listener to update EMOJI_LIST based on search text when enter is pressed
	$( ".search" ).keydown(function(e) {
		if (e.which == 13) {
			$( this ).val().length > 0 ? exposeListFilter( {search: $( this ).val()} ) : exposeListFilter( {search: undefined} );
		}
	});

	// click on emoji in list or move through emojis in detail view
	$( "#library-wrapper" ).on("click", ".emoji_single, .prev-emoji, .next-emoji", function() {
		exposeListFilter( {emoji: $( this ).attr("id")} );
	});

	// toggle outline and color in emoji detail view
	$( "#popover .emoji-preview-image" ).click(function() {
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
	$( "#author" ).click(function() {
		exposeListFilter( {author: $( this ).text(), search: undefined, group: undefined, emoji: undefined} );
		$( "#popover-wrapper" ).fadeOut(400);
	});

	// close overlay
	$( "#close-detailview" ).click(function() {
		exposeListFilter( {emoji: undefined} );
		$( "#popover-wrapper" ).fadeOut(400);
	});
});