$(document).ready(function () {
	var allSubmenus = $('#nav-items .submenu');
	var allEmojis = $('#emoji_grid .emoji_single');

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

	function handleSubMenusAndUpdateUrlAndFilters(subMenu, groupPath){
		if(subMenu){
			$(allSubmenus).not(subMenu).addClass('collapsed');
			$(subMenu).removeClass('collapsed');
		}

		exposeListFilter({
	        group: groupPath,
	        search: undefined,
	        author: undefined,
	        emoji: undefined
	    });
	    filterEmojiList(groupPath);
	}

	function filterEmojiList(groupPath){
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
})