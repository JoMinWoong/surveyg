exports.lib = {
	log:function(p,t){
		var rdm = Math.random();
		console.log("=====start:"+t+"_"+rdm+  "=====");
			console.log(p);
		console.log("=====end:"+t+"_"+rdm+  "=====");
	},
	getQuery:function(q,t){
		if(!q)return;
		var qs = q.replace("?","").split("&"),i=0;
		for(;i < qs.length;i++){
			if(qs[i].split("=")[0] == t)return qs[i].split("=")[1];
		}
	},
	isNumber: function(p) {
	    return typeof p === 'number' && isFinite(p);
	},
	isValiableText : function(p){
		return (p.length && p[0]);
	},
	isMail: function(p) {
	    return /\S+@\S+\.\S+/.test(p);
	},
	isPassword : function(p){
		return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(p);
	},
	isEngNumber : function(p){
		return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(p);
	},
	splitString:function(p){
		var arr = p.split(",");
		return (arr instanceof Array)?arr.filter(function(n){return n;}):[];
	},
	//only image file extension Jpeg,Png,Jpg,Bmp with no query
	isIMGURL:function(p){
		/* ^https?://(?:[a-z\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$ */
		/*  ^https?:\/\/((?!\?|\&).)*\.(?:jpeg|png|jpg|bmp)$  */
		//var rg = /^https?:\/\/.*\.(?:jpeg|png|jpg|bmp)$/;
		var rg = /^https?:\/\/((?!\?|\&).)*\.(?:jpeg|png|jpg|bmp)$/;
		if(p instanceof Array){
			for ( var i = 0; i < p.length; i++) {
				if(!rg.test(p[i]))return false;
			}
			return true;
		}
		else {
			return rg.test(p);
		}
	},
	//only image file extension Jpeg,Png,Jpg,Bmp with no query
	isYoutubeID:function(p){
		/* ^https?://(?:[a-z\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$ */
		/*  ^https?:\/\/((?!\?|\&).)*\.(?:jpeg|png|jpg|bmp)$  */
		//var rg = /^https?:\/\/.*\.(?:jpeg|png|jpg|bmp)$/;
		var rg = /([A-Za-z0-9_\-]{11})/;
		if(p instanceof Array){
			for ( var i = 0; i < p.length; i++) {
				if(!rg.test(p[i]))return false;
			}
			return true;
		}
		else {
			return rg.test(p);
		}
	},
	isIMGFile:function(p){
		
		var maxSize = 300;
		if(p instanceof Array){
			for ( var i = 0,datatype,imagetype; i < p.length; i++) {
				datatype = p[i].match(/data:image\/(jpeg|png|jpg|bmp);/) ,imagetype = (!datatype || !datatype.length)?false:datatype[0];
				if(!imagetype || p[i].length /4 *3 > maxSize*1000)return false;
			}
			return true;
		}
		else {
			var datatype = p.match(/data:image\/(jpeg|png|jpg|bmp);/) ,imagetype = (!datatype || !datatype.length)?false:datatype[0];
			if(!imagetype )return false;
			return p.length /4 *3 < maxSize*1000;
		}
	},
	htmlEncoding:function(p){
		var tagsToReplace = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;"
		};
		function replaceTag(tag) {
			return tagsToReplace[tag] || tag;
		}
		return p.replace(/[&<>]/g, replaceTag);
	},
	isID:function(p){
		return /^[0-9a-zA-Z_]{24,24}$/.test(p);
	}
};