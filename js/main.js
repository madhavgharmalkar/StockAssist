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



var jsonLines = [
{ "x1": 0, "y1": 300, "x2": 2000, "y2": 300},
{ "x1": 0, "y1": 340, "x2": 2000, "y2": 340},
{ "x1": 0, "y1": 380, "x2": 2000, "y2": 380},
{ "x1": 0, "y1": 420, "x2": 2000, "y2": 420},
{ "x1": 0, "y1": 460, "x2": 2000, "y2": 460},
{ "x1": 0, "y1": 500, "x2": 2000, "y2": 500},
{ "x1": 300, "y1": 0, "x2": 300, "y2": 1000},
{ "x1": 400, "y1": 0, "x2": 400, "y2": 1000},
{ "x1": 500, "y1": 0, "x2": 500, "y2": 1000},
{ "x1": 600, "y1": 0, "x2": 600, "y2": 1000},
{ "x1": 700, "y1": 0, "x2": 700, "y2": 1000},
{ "x1": 800, "y1": 0, "x2": 800, "y2": 1000}];

var svgContainer = d3.select("body").append("svg")
.attr("width", 2000)
.attr("height", 1000);

var lines = svgContainer.selectAll("line")
.data(jsonLines)
.enter()
.append("line");

var lineAttributes = lines
.attr("x1", function (d) { return d.x1; })
.attr("y1", function (d) { return d.y1; })
.attr("x2", function (d) { return d.x2; })
.attr("y2", function (d) { return d.y2; })
.attr("stroke-width", 0.5)
.attr("stroke", "black");

