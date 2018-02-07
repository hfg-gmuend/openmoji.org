$(document).ready(function(){
	var emojiList;
	var currentList;
	$.getJSON('data/openmoji.json', function(json){
		emojiList = json;
		console.log(emojiList.groups)
		currentList = emojiList
		fillList();
		// updateList();

	})

	$("body").on("click", ".emoji_single", function(){
		insertemoji($(this).attr("id"));
	})

	$("#close-detailview").on("click", function(){
		$("#popover").addClass("hidden").removeClass("visible")
	})
	
	function fillList(){
		for(var i = 0; i < emojiList.length; i++){
			$(".emoji_grid").append("<div class='emoji_single' id='"+emojiList[i].emoji+"'><div class = 'emoji-container'><img src='data/color/svg/"+emojiList[i].hexcode+".svg'></div><div><h3>"+emojiList[i].annotation+"</h3><p>"+emojiList[i].hexcode+"</p></div></div>") // data/color/svg/"+emojiList[i].hexcode+".svg
		}
	}
	function updateList(searchinput){
		$(".emoji_grid").empty()
		if(searchinput == "all OpenMojis" || searchinput == ""){
			fillList()
			currentList = emojiList
		}else{
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
					result = fuse.search(searchinput);

					//reduce current list to emojis, no score …
					currentList = []
					result.forEach(function(e){
						currentList.push(e.item)	
					})
					console.log(currentList)
					for(var i = 0; i < currentList.length; i++){
						$(".emoji_grid").append("<div class='emoji_single' id='"+currentList[i].emoji+"'><div class = 'emoji-container'><img src='data/color/svg/"+currentList[i].hexcode+".svg'></div><div><h3>"+currentList[i].annotation+"</h3><p>"+currentList[i].hexcode+"</p></div></div>")
					}
		}
	}

	function insertemoji(id){
		var currEmoji = emojiList.filter(function(item){
	    	return item.emoji == id;         
		});
		console.log(currEmoji[0].hexcode)
		//update images
		$("#main-emoji-image").attr("src","data/color/svg/"+currEmoji[0].hexcode+".svg");
		$("#outline-emoji-image-preview").attr("src","data/black/svg/"+currEmoji[0].hexcode+".svg");
		$("#color-emoji-image-preview").attr("src","data/color/svg/"+currEmoji[0].hexcode+".svg");
		//update 
		$("#description h2").text(currEmoji[0].annotation);
		$("#description #Unicode").text(currEmoji[0].hexcode);
		$("#description #author").text(currEmoji[0].hfg_author);
		//update path
		$("#description .path a:nth-child(2)").text(currEmoji[0].group);
		$("#description .path a:nth-child(3)").text(currEmoji[0].subgroups);


		$("#popover").addClass("visible").removeClass("hidden")
	}



	// bei click auf x: visiblity hidden
	// bei click auf "name des Autor" visibility hidden 

	// prevent events in bg


	$('#show-color .switch input[type=checkbox]').change(function() {
		$(".emoji_grid").empty()
		if($(this).is(":checked")){
			for(var i = 0; i < currentList.length; i++){
				$(".emoji_grid").append("<div class='emoji_single' id='"+currentList[i].emoji+"'><div class = 'emoji-container'><img src='data/color/svg/"+currentList[i].hexcode+".svg'></div><div><h3>"+currentList[i].annotation+"</h3><p>"+currentList[i].hexcode+"</p></div></div>")
			}
		}else{
			for(var i = 0; i < currentList.length; i++){
				$(".emoji_grid").append("<div class='emoji_single' id='"+currentList[i].emoji+"'><div class = 'emoji-container'><img src='data/black/svg/"+currentList[i].hexcode+".svg'></div><div><h3>"+currentList[i].annotation+"</h3><p>"+currentList[i].hexcode+"</p></div></div>")
			}
		}
	});

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

