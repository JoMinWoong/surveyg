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
	}
},
_com = {
	setState:function(p,dis){
		var sta = _doc.getElementById("state"),sta_tt = _doc.getElementById("title_state");
		if(!sta)return;
		//set hidden statevalue
		sta.value = p;
		sta_tt.innerHTML = (!p)?"state":dis.innerHTML; 
		
	},
	setCategory:function(p,dis){
		var sta = _doc.getElementById("category"),sta_tt = _doc.getElementById("title_category");
		if(!sta)return;
		//set hidden statevalue
		sta.value = p;
		sta_tt.innerHTML = (!p)?"category":dis.innerHTML; 
	}
} 