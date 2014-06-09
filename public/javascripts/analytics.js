$Analytics = function(){
	this.data = {graph:{}};
	this.init = function(){
		for ( var k in this.convertdata) {
			this.convertdata[k]();
		}
	};
	this.start = function(){
		this.init();
		
		for ( var k in this.data.graph) {
			this.graph[k](this.data.graph[k]);
			for ( var i = 0; i < this.data.graph[k].length; i++) {
				this.graph[k](this.data.graph[k][i],i);
			}
			
		}
	};
}
$Analytics.prototype = {
	convertdata : {
		barChart_g : function(){
			new_analytics.data.graph.barChart_g = []
			for ( var i = 0; i < _inputdata.length; i++) {
				var res = {test:"test"},color = [0,"#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8F00FF"],key = [];
				res.data = [];
				res.data.push(["Answer", "Number", { role: "style" } ]);
				for ( var k in _inputdata[i].value.data) {
					res.data.push([k,_inputdata[i].value.data[k],color[++color[0]]]);
				}
				res.id = "barchart_values";
				new_analytics.data.graph.barChart_g.push(res);
			}
		}
	},
	graph : {
		barChart_g : function(d,index){
			google.load("visualization", "1", {packages:["corechart"]});
		    google.setOnLoadCallback(drawChart);
		    function drawChart() {
//		    	[
//		 		["Element", "Density", { role: "style" } ],
//		 	    ["Copper", 8.94, "#b87333"],
//		 		["Silver", 10.49, "silver"],
//		 		["Gold", 19.30, "gold"],
//		 		["Platinum", 21.45, "color: #e5e4e2"]
//		 	      ]
		      var data = google.visualization.arrayToDataTable(d.data);

		      var view = new google.visualization.DataView(data);
		      view.setColumns([0, 1,
		                       { calc: "stringify",
		                         sourceColumn: 1,
		                         type: "string",
		                         role: "annotation" },
		                       2]);

		      var options = {
			title: d.title,
			width: 600,
			height: 400,
			bar: {groupWidth: "95%"},
		        legend: { position: "none" },
		      };
		      //<div>[<newdiv>new graph</newdiv>]</div>
		      var parent = document.getElementById(d.id);
		      var chart = new google.visualization.BarChart(parent.appendChild(_lib.createElm("div",{id:d.id+"child_"+index})));
		      chart.draw(view, options);
		  }
		}
	}
};
var new_analytics = new $Analytics();
new_analytics.start();