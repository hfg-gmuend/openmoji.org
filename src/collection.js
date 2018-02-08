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
	//smooth scroll in styleguide
	$(document).on('click', 'a[href^="#"]', function (event) {
	    event.preventDefault();
	    $('html, body').animate({
	        scrollTop: ($($.attr(this, 'href')).offset().top - 190)
	    }, 500);
	});
	
// click on emoji
	$("body").on("click", ".emoji_single", function(){
		insertemoji($(this).attr("id"));
	})
	
	//toggle outline and color
	$("#outline-emoji-preview").on("click", function(){
		// outline icon
		$("#main-emoji-image").attr("src", $("#main-emoji-image").attr("src").replace("color", "black"))
		$("#color-emoji-preview").removeClass("highlight")
		$("#outline-emoji-preview").addClass("highlight")
	})

	$("#color-emoji-preview").on("click", function(){
		// color icon
		$("#main-emoji-image").attr("src", $("#main-emoji-image").attr("src").replace("black", "color"))
		$("#color-emoji-preview").addClass("highlight")
		$("#outline-emoji-preview").removeClass("highlight")
	})

	//author search
	$('#author').on("click", function(){
		$("#selected-category").text($(this).text())
		$("#popover-wrapper").fadeOut(200)
		$("body").css("overflow", "auto")
		$( "body" ).scrollTop( 0 );
		updateList($(this).text())
		console.log($(this).text())
	})

	//move through emoji
	$(".prev-emoji").on("click", function(){
		insertemoji($(this).attr("id"));
	})

	$(".next-emoji").on("click", function(){
		insertemoji($(this).attr("id"));
	})


	//close overlay
	$("#close-detailview").on("click", function(){
		$("#popover-wrapper").fadeOut(400)
		$("body").css("overflow", "auto")
	})
	
	function fillList(){
		for(var i = 0; i < emojiList.length; i++){
			$(".emoji_grid").append("<div class='emoji_single' id='"+emojiList[i].emoji+"'><div class = 'emoji-container'><img src='data/color/svg/"+emojiList[i].hexcode+".svg'></div><div><h3>"+emojiList[i].annotation+"</h3><p>"+emojiList[i].hexcode+"</p></div></div>") // data/color/svg/"+emojiList[i].hexcode+".svg
		}
	}
	function updateList(searchinput){
		$( "body" ).scrollTop( 0 );
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


	function updatebycategory(searchinput){
		$( "body" ).scrollTop( 0 );
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
					  keys: [
					  	{
					    	name: "group",
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
		var currEmoji = currentList.filter(function(item){
	    	return item.emoji == id;         
		});
	    // get in index of current object
	    var index = currentList.indexOf(currEmoji[0])
	    console.log(currEmoji);	        
		//update i mages
		$("#main-emoji-image").attr("src","data/color/svg/"+currEmoji[0].hexcode+".svg");
		$("#outline-emoji-image-preview").attr("src","data/black/svg/"+currEmoji[0].hexcode+".svg");
		$("#color-emoji-image-preview").attr("src","data/color/svg/"+currEmoji[0].hexcode+".svg");
		//update 
		$("#description h2").text(currEmoji[0].annotation);
		$("#description #unicode").text(currEmoji[0].hexcode);
		$("#description #author").text(currEmoji[0].hfg_author);
		$("#description #category").text(currEmoji[0].group);
		$("#description #subcategory").text(currEmoji[0].subgroups);
		//update path
		$("#description .path a:nth-child(2)").text(currEmoji[0].group);
		$("#description .path a:nth-child(3)").text(currEmoji[0].subgroups);
		//update prev und next
		
		if(index == 0){
			$(".prev-emoji .icon-img").attr("src","data/color/svg/"+currentList[currentList.length-1].hexcode+".svg");
			$(".prev-emoji").attr("id",""+currentList[index + 1].emoji+"");
			
			$(".next-emoji .icon-img").attr("src","data/color/svg/"+currentList[index + 1].hexcode+".svg");
			$(".next-emoji").attr("id",""+currentList[index + 1].emoji+"");
		}else if(index == currentList.length - 1){
			$(".prev-emoji").attr("id",""+currentList[index - 1].emoji+"");
			$(".prev-emoji .icon-img").attr("src","data/color/svg/"+currentList[index - 1].hexcode+".svg");
			
			$(".next-emoji").attr("id",""+currentList[0].emoji+"");
			$(".next-emoji .icon-img").attr("src","data/color/svg/"+currentList[0].hexcode+".svg");
		}else{
			$(".prev-emoji").attr("id",""+currentList[index - 1].emoji+"");
			$(".prev-emoji .icon-img").attr("src","data/color/svg/"+currentList[index - 1].hexcode+".svg");
			
			$(".next-emoji").attr("id",""+currentList[index + 1].emoji+"");
			$(".next-emoji .icon-img").attr("src","data/color/svg/"+currentList[index + 1].hexcode+".svg");
		}

		$("#popover-wrapper").fadeIn(300)
		$("body").css("overflow", "hidden")
	}



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
		updatebycategory($(this).val());
	});

	$( ".search" ).keydown(function( event ) {
  		if ( event.which == 13 ) {
  			$("#selected-category").text($(".search").val())
			updateList($(".search").val());
  		}
  	});
	
})

