$(document).ready(function(){
	var emojiList;
	$.getJSON('data/hfg-emojis-list.json', function(json){
		emojiList = json;
		console.log(emojiList.groups)
		fillList();
		// updateList();

	})
	
	function fillList(){
		console.log(emojiList)
		for(var i = 0; i < emojiList.length; i++){
			$(".emoji_grid").append("<div class='emoji_single'><div class = 'emoji-container'><img src='data/color/svg/"+emojiList[i].hexcode+".svg'></div><div><h3>"+emojiList[i].annotation+"</h3><p>"+emojiList[i].hexcode+"</p></div></div>")
		}
	}
	function updateList(searchinput){
		$(".emoji_grid").empty()
		var options = {
		  shouldSort: true,
		  tokenize: true,
		  includeScore: true,
		  threshold: 0.1,
		  location: 0,
		  distance: 100,
		  maxPatternLength: 32,
		  minMatchCharLength: 0,
		  keys: [{
		  		name: "emoji",
		  		weight: 1
		  	},{
		  		name: "hexcode",
		  		weight: 1
			},{
		    	name: "group",
		    	weight: 0.9
			},{
		    	name: "subgroups",
		    	weight: 0.8
			},{
		    	name: "annotation",
		    	weight: 1
			},{
		    	name: "tags",
		    	weight: 0.5
			},{
		    	name: "hfg_tags",
		    	weight: 0.4
		    },{
		    	name: "hfg_author",
		    	weight: 1
		  }]
		};
		var fuse = new Fuse(emojiList, options); // "list" is the item array
		var result = fuse.search(searchinput);
		console.log(result)
		for(var i = 0; i < result.length; i++){
			$(".emoji_grid").append("<div class='emoji_single'><div class = 'emoji-container'><img src='data/color/svg/"+result[i].item.hexcode+".svg'></div><div><h3>"+result[i].item.annotation+"</h3><p>"+result[i].item.hexcode+"</p></div></div>")
		}
	}

	$('input[type=radio][name=category]').change(function() {
		$("#selected-category").text($(this).val())
		updateList($(this).val());
	});

	$( ".search" ).keydown(function( event ) {
  		if ( event.which == 13 ) {
  			$("#selected-category").text($(".search").val())
			updateList($(".search").val());
  		}
  	});
	
})

