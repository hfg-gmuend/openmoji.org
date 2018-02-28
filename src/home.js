$(document).ready(function() {
	//------------ Emoji Cloud ------------
	var EMOJI_LIST;
	const EMOJI_POSITIONS = getPositions( 1.4, 300 );

	// get all emojis and generate category showcase
	$.getJSON( "data/openmoji.json" , function(json) {
		EMOJI_LIST = json;

		genEmojiCloud();
		genCategoriesShowcase();
	});

	function genEmojiCloud() {
		// randomize EMOJI_LIST
		shuffledList = shuffleArr(EMOJI_LIST);

		// populate html with emojis
		for(var i = 0; i < EMOJI_POSITIONS.length; i++) {
			// break out of loop if array doesn't have new emojis anymore
			if(i >= shuffledList.length) break;

			var xPos = EMOJI_POSITIONS[i].x + 50;
			var yPos = EMOJI_POSITIONS[i].y + 50;

			// add emoji to html
			if( !(xPos >= -5 && xPos <= 105 && yPos >= 0 && yPos <= 100) ) $( "#landing .content" ).append("<img class='emoji' src='data/color/svg/" + shuffledList[i].hexcode + ".svg' align='middle' style='top: " + xPos + "%; left: " + yPos + "%'>");
		}
	}

	// get emoji positions based on the Vogel/Fermat spiral Equation
	function getPositions( a, n ) {
		var positions = [];
		const GOLDEN_ANGLE = 137.508;

		for(var i = 1; i <= n; i++) {
			var theta = i * GOLDEN_ANGLE;

			// calculate x and y position
			var xPos = Math.sign(a) * Math.abs(a) * Math.pow(theta, 0.5) * Math.cos(theta);
			var yPos = Math.sign(a) * Math.abs(a) * Math.pow(theta, 0.5) * Math.sin(theta);

			// push coordinates into position array
			positions.push( {x: xPos, y: yPos} );
		}

		return positions;
	}


	//------------ Category showcase ------------
	// Object that holds all Categories with their html display name and corresponding group in the emoji list 
	const CATEGORIES = {"Interaction": "interaction",
						"UI Design": "ui-element",
						"Technology": "technology"};
	const EXAMPLES_COUNT = 6;
	var categorySlideInterval;
	const CATEGORY_SLIDE_INTERVAL_TIMEOUT = 4000;

	function genCategoriesShowcase() {
		// add categories to html
		var html = "<div class='row'>";

		var firstCategory = true;

		for(var category in CATEGORIES) {
			if(CATEGORIES.hasOwnProperty(category)) {
				if(firstCategory) {
					html += "<a class='categories-item active-tab' data-category='" + CATEGORIES[category] + "' href=''>"
							+ "<h2>" + category + "</h2></a>";
					firstCategory = false;
				} else {
					html += "<a class='categories-item' data-category='" + CATEGORIES[category] + "' href=''>"
							+ "<h2>" + category + "</h2></a>";
				}
			}
		}
		html += "</div>";

		// populate html
		$( "#categories-showcase #categories" ).append(html);

		showCategoryExamples( $( "#categories-showcase #categories .active-tab" ).data("category") );

		// set interval to slide to next category every 4 seconds
		categorySlideInterval = setInterval(slideCategory, CATEGORY_SLIDE_INTERVAL_TIMEOUT);
	}

	function showCategoryExamples( category ) {
		// empty div
		$( "#categories-showcase #examples" ).empty();

		// mark clicked item as active and currently active item as non active
		$( "#categories-showcase #categories .active-tab" ).removeClass("active-tab");
		$( "#categories-showcase #categories" ).find("[data-category='" + category + "']").addClass("active-tab");

		// get all emojis from specified category
		filteredList = EMOJI_LIST.filter( emoji => emoji.group === category || emoji.subgroups === category );

		// randomize array
		filteredList = shuffleArr(filteredList);

		// add emojis to html
		var html = "";

		html += "<div class='row'>";
		// add emojis
		for(var i = 0; i < EXAMPLES_COUNT; i++) {
			// break out of loop if array doesn't have new emojis anymore
			if(i >= filteredList.length) break;

			html += "<img class='categories-item' src='data/color/svg/" + filteredList[i].hexcode + ".svg'>";
		}
		html += "</div>";

		// populate html
		$( "#categories-showcase #examples" ).append(html);

		// set element width based on column count
		$( "img.categories-item" ).css("width", 100 / Object.keys(CATEGORIES).length + "%");
	}

	function slideCategory() {
		var currentCategoryIdx = Object.values(CATEGORIES).indexOf($( "#categories-showcase #categories .active-tab" ).data("category"));

		// increment index
		currentCategoryIdx++;

		// reset index to 0 index is out of array
		if(currentCategoryIdx >= Object.values(CATEGORIES).length) {
			currentCategoryIdx = 0;
		}

		// trigger resize event to avoid jumpy transition
		$( window ).trigger($.Event("resize"));

		// update category selection
		showCategoryExamples(Object.values(CATEGORIES)[currentCategoryIdx]);
	}


	//------------ Event listeners ------------
	// search field listener to change location to library.html and set search filter
	$( ".search" ).keydown(function(e) {
		if (e.which == 13) {
			window.location.href = "http://" + window.location.href.split("/")[2] + "/library.html?search=" + $( this ).val();
		}
	});

	// switch category when clicked
	$( "#categories-showcase" ).on("click", "a.categories-item", function(e) {
		e.preventDefault();

		// check if clicked item is already active
		if(!$( this ).hasClass("active-tab")) {
			// refresh example emojis
			showCategoryExamples($( this ).data("category"));

			// reset categorySlideInterval
			clearInterval(categorySlideInterval);
			categorySlideInterval = setInterval(slideCategory, CATEGORY_SLIDE_INTERVAL_TIMEOUT);
		}
	});

	// window resize listener
	$( window ).resize(function() {
		// reset min-height to current height of categories showcase container element to avoid jumpy transition when selected category changes
		$( "#categories-showcase .content" ).css("min-height", "");
		$( "#categories-showcase .content" ).css("min-height", $( "#categories-showcase .content" ).height());
	});
});