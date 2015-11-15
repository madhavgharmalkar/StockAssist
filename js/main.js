jQuery(document).ready(function($) {
	

	$("#click").click(function(event) {
		$.ajax({
			url: window.location + "/twitter?q="+$("#stock").val(),
			type: 'GET',
		})
		.done(function() {
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
	});






});