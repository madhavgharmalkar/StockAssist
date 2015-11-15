jQuery(document).ready(function($) {
	

	$("#click").click(function(event) {
		$.ajax({
			url: "http://stockassist.azurewebsites.net/twitter?q="+$("#stock").val(),
			type: 'GET'
		})
		.done(function(data) {
			console.log(data);
			#("#good").text(data.positive);
			#("#bad").text(data.negative);
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});

		// $("#title").transition({top: "1vh"});
		// $("#input").transition({top: "-6vh"});





	});



});






