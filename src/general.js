//------------ Gerneral Functions ------------
//------------ nav ------------
var navItemGotClicked = false;
// mark selected item in nav
function markNavItem(item) {
	// get corresponding nav-item
	var navItem = $( "#nav-items" ).find("[data-item='" + item + "']");
	// get corresponding mainMenu
	var mainMenu = navItem.hasClass("mainmenu") ? navItem : navItem.parents(".mainmenu");

	// close all other expanded mainmenus
	$("#nav-items .mainmenu").not(mainMenu).each(function(idx, currMainMenu) {
		var currSubMenu = $( currMainMenu ).children(".submenu")[0];
		if (currSubMenu && currSubMenu.style.maxHeight){
			currSubMenu.style.maxHeight = null;
		}
	});

	// if item is undefined set all nav-items to unchecked
	if(item === undefined) {
		$( "#nav-items" ).find("input:checked").prop("checked", false);
	} else {
		// expand or condense submenu (if exisiting) if mainmenu was clicked and always expand submenu if submenu item was clicked
		var subMenu = mainMenu.children(".submenu")[0];
		if(subMenu) {
			if (subMenu.style.maxHeight && navItem.hasClass("mainmenu") && navItemGotClicked) {
				subMenu.style.maxHeight = null;
			} else {
				subMenu.style.maxHeight = subMenu.scrollHeight + "px";
			}
		}

		// mark (sub-)category in nav-bar as selected
		$( navItem.find("input")[0] ).prop("checked", true);
	}

	navItemGotClicked = false;
}


$(document).ready(function() {
	//------------ Event listeners ------------
	// nav-item click listener for smooth scroll
	$( "#nav-items" ).on("click", "a[href^='#']", function() {

		var href = $( this ).attr("href");

		// only scroll if scrollPos is different from current pos
		if(Math.floor($( href ).offset().top) != $( "main" ).offset().top) {
			$( "main" ).animate({
				scrollTop: $( href ).position().top
			}, 500);
		}

		// mark corresponding nav-item and handle submenu expansion
		navItemGotClicked = true;
		markNavItem(href.substring(href.indexOf("#") + 1, href.length));
	});
});