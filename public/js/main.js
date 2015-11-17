jQuery(document).ready(function($) {


	var ctx = document.getElementById("leftChart").getContext("2d");
	// var chart = new Chart(ctx);
	var myPieChart;

	var open = false;


	function sendData(){

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

			var options = {};
			var datas = [
			{
				value: data.positive,
				color: "#1e7b75",
				highlight: "#26a69a",
				label: "positive"
			},
			{
				value: data.negative,
				color: "#808080",
				highlight: "#b3b3b3",
				label: "negative"	
			}
			]

			if(myPieChart!=null){
				myPieChart.destroy();
			}


			myPieChart = new Chart(ctx).Doughnut(datas,options);

			// console.log(data);

			$("#prediction").text(data.prediction);
			

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
	}

	$("#input-23").keydown(function(e) {
		if (e.keyCode == 13) {
			console.log("sent");
			sendData();

		}
	});

	$("#click").click(function(event) {
		sendData();
	});



});






