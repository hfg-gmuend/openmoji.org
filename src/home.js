$(document).ready(function() {
	//------------ Event listeners ------------
	// search field listener to change location to library.html and set search filter
	$( ".search" ).keydown(function(e) {
		if (e.which == 13) {
			window.location.href = "http://" + window.location.href.split("/")[2] + "/library.html?search=" + $( this ).val();
		}
	});
});