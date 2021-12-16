var allSubmenus
var allEmojis
$(document).ready(function () {
	allSubmenus = $('#nav-items .submenu');
	allEmojis = $('#emoji_grid .emoji_single');

	updateViewAccordingToUrl();

	$('#nav-items input').on('change', function(e){
		e.stopPropagation();
		if(e.target.value === 'all OpenMojis'){
			handleSubMenusAndUpdateUrlAndFilters(undefined, undefined);
		}else{
			var groupPath = $(this).attr("data-grouppath");
			var subMenu = $(this).parent().find('.submenu')[0];
			handleSubMenusAndUpdateUrlAndFilters(subMenu, groupPath);
		}
	})
})


function updateViewAccordingToUrl(){
	var initialParameters = getUrlParameters();
	if(initialParameters){
		let groupPath = initialParameters.group || undefined
		let author = initialParameters.author || undefined;

		let subMenu = undefined
		if(groupPath){
			let split = groupPath.split('/');
			let group = split[0];
			subMenu = $('#nav-items > li[data-item="' + group + '"] > .submenu')[0];
		}
		handleSubMenusAndUpdateUrlAndFilters(subMenu, groupPath);
	    filterEmojiList(groupPath, author);
    }
}

function handleSubMenusAndUpdateUrlAndFilters(subMenu, groupPath){
	if(subMenu){
		$(allSubmenus).not(subMenu).addClass('collapsed');
		$(subMenu).removeClass('collapsed');
	}else{
		$(allSubmenus).not(subMenu).addClass('collapsed');
	}

	exposeListFilter({
        group: groupPath,
        search: undefined,
        author: undefined,
        emoji: undefined
    });
    filterEmojiList(groupPath, undefined);
}

function filterEmojiList(groupPath, author){
	if(!groupPath){
		$(allEmojis).removeClass('hiddenDueToGroupOrSubgroup');
	}else{
		let split = groupPath.split('/');
		let group = split[0];
		let subgroup = split[1] || null;
		
		if(!subgroup){
			$(allEmojis).filter('[data-group="' + group + '"]').removeClass('hiddenDueToGroupOrSubgroup');
			$(allEmojis).not('[data-group="' + group + '"]').addClass('hiddenDueToGroupOrSubgroup');
		}else{
			$(allEmojis).filter('[data-group="' + group + '"][data-subgroups="' + subgroup + '"]').removeClass('hiddenDueToGroupOrSubgroup');
			$(allEmojis).not('[data-group="' + group + '"][data-subgroups="' + subgroup + '"]').addClass('hiddenDueToGroupOrSubgroup');
		}
	}

	if(author){
		$(allEmojis).filter('[data-author="' + author + '"]').removeClass('hiddenDueToAuthor');
		$(allEmojis).not('[data-author="' + author + '"]').addClass('hiddenDueToAuthor');
	}else{
		$(allEmojis).removeClass('hiddenDueToAuthor');
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