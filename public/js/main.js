jQuery(document).ready(function($) {


	var ctx = document.getElementById("leftChart").getContext("2d");

	$("#click").click(function(event) {

		$.ajax({
			url: "http://stockassist.azurewebsites.net/twitter?q="+$("#input-23").val(),
			type: 'GET'
		})
		.done(function(data) {


			$("#twoThirds")
			.transition({height: "50vh"});
			$("#oneThird")
			.transition({display: "block"})
			.transition({height: "50vh"});

			$("#left-bottom").transition({display: "block", delay: 1000});
			$("#right-bottom").transition({display: "block", delay: 1000});


			console.log(data);

			$("#prediction").text(data.prediction);
			
			var options = {};
			var data = [
			{
				value: data.positive,
				color: "#2c3e50",
				highlight: "#34495e",
				label: "positive"
			},
			{
				value: data.negative,
				color: "#c0392b",
				highlight: "#e74c3c",
				label: "negative"	
			}
			]


			var myPieChart = new Chart(ctx).Doughnut(data,options);
			myPieChart.update();


			// $("#good").text(data.positive);
			// $("#bad").text(data.negative);
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






