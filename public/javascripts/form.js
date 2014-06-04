var FormConstructor = function (){
	this.lib = {
		getURLQuery:function () {
			for (var i=0,res = {},query = window.location.search.substring(1),vars = query.split("&"),pair;i<vars.length;i++) {
			    pair = vars[i].split("=");
			    if (typeof res[pair[0]] === "undefined") { res[pair[0]] = pair[1]; } 
			    else if (typeof res[pair[0]] === "string") {
			    	var arr = [ res[pair[0]], pair[1] ];
			    	res[pair[0]] = arr;
			    } else { res[pair[0]].push(pair[1]); }
			}
			return res;
		},
		getATCPID:function(p){
			return (FormAssist_Data)?(FormAssist_Data[p][33] == "_faid")?p:FormAssist_Data[p][33]:false;
		},
		//encryption <-> decryption
		encdec:function(p){
			if(typeof p != "string")return false;
			var k = 0x2EDF160D98,res = "",i = 0,n;
			k = k.toString(10);
			n = k.length;
			for (; i < p.length; i++) {
				res += String.fromCharCode(k[i % n] ^ p.charCodeAt(i));
			}
			return res;
		},
		jsparse:function(p){
			try {
				return JSON.parse(p);
			} catch (e) {
				return {};
			}
		},
		jsstringify:function(p){
			try {
				return JSON.stringify(p);
			} catch (e) {
				return "";
			}
		},
		posxy: function(e) {
            var res = {x:0, y:0};
            do {
                res.x += e.offsetLeft;
                res.y += e.offsetTop;
                if (e == document.body) {
                    break;
                }
            } while (e = e.offsetParent);
            return res;
	    },
	    addEvent: function(elm, type, listener, flg) {
            if ($FA_ATCP.com.isTouchable) {
                if (type == "mouseup") type = "touchend";
                else if (type == "mousedown") type = "touchstart";
            }
            if (!elm || typeof (elm) == 'undefined') return;
            if (elm.addEventListener) elm.addEventListener(type, listener, flg);
            else elm.attachEvent('on' + type, function() { listener.call(elm, window.event); });
            return elm;
        },
		createElm: function(t, p, f) {
            var e = document.createElement(t + ""), k, i;
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
                	if(k == "onmouseup" && $FA_ATCP.com.isTouchable) e["ontouchend"] = p[k];
                	else if(k == "onmousedown" && $FA_ATCP.com.isTouchable) e["ontouchstart"] = p[k];
                	else e[k] = p[k];
                }
            }
            if (f) e.className += " NC_spc_noconv";
            return e;
        }
	};
	this.com = {
		isTouchable:('ontouchstart' in window),
		isSP:(function(){
			for (var sp = ["iPhone", "Android"], ua = window.navigator.userAgent,i=0; i < sp.length; i++) {
				if (ua.toLowerCase().indexOf(sp[i].toLowerCase()) != -1) return true;
			}
			return false;
		})()
	};
};
FormConstructor.prototype.start = function(data){
	var content = document.getElementById("content"),inputelms = data.input,ol = document.createElement("ol"),datagroup = data.datagroup;
	for ( var i = 0; i < inputelms.length; i++) {
		var li = document.createElement("li");
		//add input title
		li.appendChild(this.lib.createElm("DIV",{innerHTML:inputelms[i].item.title}));
		for ( var j = 0; j < inputelms[i].elms.length; j++) {
			
			inputelms[i].elms[j].name = datagroup+"["+inputelms[i].elms[j].name+"]"; 
			console.log(inputelms[i].elms[j]);
			inputelms[i].elms[j].id = "id_"+i+"_"+j;
			//add input element
			if(inputelms[i].elms[j].tagName=="SELECT"){
				var sel = this.lib.createElm(inputelms[i].elms[j].tagName,inputelms[i].elms[j]),opts = inputelms[i].elms[j].options || [];
				for ( var k = 0; k < opts.length; k++) {
					sel.appendChild(this.lib.createElm("OPTION",opts[k]));
				}
				li.appendChild(sel);
			}
			else {
				li.appendChild(this.lib.createElm(inputelms[i].elms[j].tagName,inputelms[i].elms[j]));
			}
			//add label
			if(inputelms[i].elms[j].label) {
				li.appendChild(this.lib.createElm("LABEL",{innerHTML:inputelms[i].elms[j].label,htmlFor:inputelms[i].elms[j].id}));
			}
		}
		ol.appendChild(li);
	}
	content.appendChild(ol);
	
}
var formConstructor = new FormConstructor();
formConstructor.start(data);

