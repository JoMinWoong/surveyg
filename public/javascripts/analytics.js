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
			if(!this.data.graph[k]){ continue; }
			this.graph[k](this.data.graph[k]);
			for ( var i = 0; i < this.data.graph[k].length; i++) {
				this.graph[k](this.data.graph[k][i],i);
			}
			
		}
	};
}
$Analytics.prototype = {
	convertdata : {
		areaChart_datecount_g : function(){
			if(!_datecount || !_datecount.length) { new_analytics.data.graph.areaChart_datecount_g = false; return; }
			for ( var i = 0,datecountdata = []; i < _datecount.length; i++) {
				
				datecountdata.push([
				                    _datecount[i]._id.year+"/"+_datecount[i]._id.month+"/"+_datecount[i]._id.day,
				                    _datecount[i].count,_datecount[i].count + Math.round(Math.random() * 20)]);
			}
	    	datecountdata.push(['Date', '返答数', 'PV(TODO)']);
			new_analytics.data.graph.areaChart_datecount_g = datecountdata.reverse();
		},
		pieChart_area_g : function(){
			if(!_area || !_area.length) {new_analytics.data.graph.pieChart_area_g = false; return;}
			var res = {data:[['Task', 'Hours per Day']], title:"area"};
			for ( var i = 0; i < _area.length; i++) {
				res.data.push([(_area[i]._id || "undefined area"), _area[i].count])
			}
			new_analytics.data.graph.pieChart_area_g = [res];
		},
		pieChart_useragent_g : function(){
			if(!_useragent || !_useragent.length) {new_analytics.data.graph.pieChart_useragent_g = false; return;}
			var res = {data:[['UA', 'useragent of writter']], title:"user agent"};
			for ( var i = 0; i < _useragent.length; i++) {
				res.data.push([_useragent[i]._id, _useragent[i].count])
			}
			new_analytics.data.graph.pieChart_useragent_g = [res];
		},
		barChart_value_g : function(){
			if(!_inputdata || !_inputdata.length) {new_analytics.data.graph.barChart_value_g = false; return;}
			new_analytics.data.graph.barChart_value_g = [];
			for ( var i = 0; i < _inputdata.length; i++) {
				var res = {},color = [0,"#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8F00FF"],
					key = [],questionformdata = _questionform[_inputdata[i]._id];
				res.data = [];
				res.data.push(["Answer", "Number", { role: "style" } ]);
				if(typeof _inputdata[i].value.data == "object") {
					for ( var k in _inputdata[i].value.data) {
						var columnname = k;
						for ( var l = 0; l < questionformdata.elms.length; l++) {
							if(questionformdata.elms[l].value == k){
								columnname = questionformdata.elms[l].label;
								break;
							}
						}
						res.data.push([columnname,_inputdata[i].value.data[k],color[++color[0]]]);
					}
				}
				else {
					for ( var l = 0,columnname = _inputdata[i].value.data; l < questionformdata.elms.length; l++) {
						if(questionformdata.elms[l].value == columnname){
							columnname = questionformdata.elms[l].label;
							break;
						}
					}
					res.data.push([columnname,1,color[++color[0]]]);
				}
				res.id = "barchart_values";
				res.title = questionformdata.item.title;
				new_analytics.data.graph.barChart_value_g.push(res);
			}
		}
	},
	graph : {
		areaChart_datecount_g : function(d,index){
			google.load("visualization", "1", {packages:["corechart"]});
		    google.setOnLoadCallback(drawChart);
		    function drawChart() {
		    	var data = google.visualization.arrayToDataTable(d);

	                    var options = {
	                      title: 'Day count',
	                      hAxis: {title: 'YMD',  titleTextStyle: {color: '#333'}},
	                      vAxis: {minValue: 0}
	                    };

	                    var chart = new google.visualization.AreaChart(document.getElementById('areachart_datecount'));
	                    chart.draw(data, options);
		    }
		},
		pieChart_area_g : function(d,index){
			google.load("visualization", "1", {packages:["corechart"]});
		      google.setOnLoadCallback(drawChart);
		      function drawChart() {
		        var data = google.visualization.arrayToDataTable(
		        		d.data
		        		);

		        var options = {
		          title: d.title
		        };

		        var chart = new google.visualization.PieChart(document.getElementById('piechart_area'));
		        chart.draw(data, options);
		      }
		},
		pieChart_useragent_g : function(d,index){
			google.load("visualization", "1", {packages:["corechart"]});
		      google.setOnLoadCallback(drawChart);
		      function drawChart() {
		        var data = google.visualization.arrayToDataTable(
		        		d.data
		        		);

		        var options = {
		          title: d.title
		        };

		        var chart = new google.visualization.PieChart(document.getElementById('piechart_useragent'));
		        chart.draw(data, options);
		      }
		},
		barChart_value_g : function(d,index){
			google.load("visualization", "1", {packages:["corechart"]});
		    google.setOnLoadCallback(drawChart);
		    function drawChart() {
		      var data = google.visualization.arrayToDataTable(d.data),
		      	view = new google.visualization.DataView(data);
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
		      // <div>[<newdiv>new graph</newdiv>]</div>
		      var parent = document.getElementById(d.id);
		      var chart = new google.visualization.BarChart(parent.appendChild(_lib.createElm("div",{id:d.id+"child_"+index,css:{margin:"10px"}})));
		      chart.draw(view, options);
		  }
		}
	}
};
var new_analytics = new $Analytics();
new_analytics.start();