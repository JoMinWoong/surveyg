var _doc = document,_lib = {
	getQuery:function(q,t){
		if(!q)return;
		var qs = q.replace("?","").split("&"),i=0,res = {},sp;

		for(;i < qs.length;i++){
			sp = qs[i].split("=");
			if(!t) res[sp[0]] = decodeURIComponent(sp[1]);
			else if(sp[0] == t)return sp[1];
		}
		return res;
	},
	getYoutubeInfo:function(p){
		//<iframe width="560" height="315" src="//www.youtube.com/embed/htA0mqYrCTE?rel=0" frameborder="0" allowfullscreen></iframe>
		//http://www.youtube.com/watch?v=htA0mqYrCTE
		return {
			imgs:["http://img.youtube.com/vi/"+p+"/0.jpg","http://img.youtube.com/vi/"+p+"/1.jpg","http://img.youtube.com/vi/"+p+"/2.jpg","http://img.youtube.com/vi/"+p+"/3.jpg"],
			url:"http://www.youtube.com/watch?v="+p,
			embeded:'<iframe width="560" height="315" src="//www.youtube.com/embed/"'+p+'"?rel=0" frameborder="0" allowfullscreen></iframe>'
		};
		
	},
	escape:function(str){
		return $("<div></div>").text(str).html();
	},
	isNumber: function(p) {
	    return typeof p === 'number' && isFinite(p);
	},
    createElm: function(t, p, f) {
        var e = _doc.createElement(t + ""), k, ek, i;
        for (k in p) {
            if (k == "appendChild") {
                if ("function" == typeof p[k]) {
                    e.appendChild(p[k]());
                } else if (p[k] instanceof Array) {
                    for (i = 0; i < p[k].length; i++) {
                        e.appendChild(p[k][i]);
                    }
                } else
                    e.appendChild(p[k]);
            } else if (k == "css") {
                for (var ck in p[k]) {
                    e.style[ck] = p[k][ck];
                }
            } else if (k == "cssText") {
                e.style.cssText += " ;" + p[k] + ";";
            } else {
                if (!_conf.isPC) {
                    if (k == "onmouseup")
                        ek = "ontouchend";
                    else if (k == "onmousedown")
                        ek = "ontouchstart";
                    else
                        ek = k;
                    e[ek] = p[k];
                } else
                    e[k] = p[k];
            }
        }
        if (f) e.className += " NC_spc_noconv";
        return e;
    }
};
var _conf = {
	isPC:'ontouchstart' in document.documentElement
};
var func = {
	barChart : function(id,d){ return false;
		// For horizontal bar charts, x an y values must will be "flipped"
	    // from their vertical bar counterpart.
        //[[2,1], [4,2], [6,3], [3,4]], 
        //[[5,1], [1,2], [3,3], [4,4]], 
        //[[4,1], [7,2], [1,3], [2,4]]
	    var plot2 = $.jqplot(id, d, {
	        seriesDefaults: {
	            renderer:$.jqplot.BarRenderer,
	            // Show point labels to the right ('e'ast) of each bar.
	            // edgeTolerance of -15 allows labels flow outside the grid
	            // up to 15 pixels.  If they flow out more than that, they 
	            // will be hidden.
	            pointLabels: { show: true, location: 'e', edgeTolerance: -15 },
	            // Rotate the bar shadow as if bar is lit from top right.
	            shadowAngle: 135,
	            // Here's where we tell the chart it is oriented horizontally.
	            rendererOptions: {
	                barDirection: 'horizontal'
	            }
	        },
	        axes: {
	            yaxis: {
	                renderer: $.jqplot.CategoryAxisRenderer
	            }
	        }
	    });
	}
}
