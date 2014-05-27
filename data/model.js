/**
 * @author yesseyall
 * @description stuff data provider
 * @version 0.1
 */

var Db = require("mongodb").Db,
	Connection = require("mongodb").Connection,
	Server = require("mongodb").Server,
	BSON = require("mongodb").BSON,
	ObjectID = require("mongodb").ObjectID,
	//expressValidator = require("express-validator"),//https://github.com/ctavan/express-validator
//var crypto = require("crypto"),shasum = crypto.createHash("sha1");
	jsdata = require("./jsdata"),
	com = require("../lib/common"),_lib = com.lib,geoip = require('geoip-lite');;

monoProvider = function(host, port) {
  this.db= new Db("surveyg", new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

monoProvider.prototype.getCollection_user= function(callback) {
  this.db.collection("user", function(error, mono_collection) {
    if( error ) callback(error);
    else callback(null, mono_collection);
  });
};

monoProvider.prototype.getCollection_survey= function(callback) {
  this.db.collection("survey", function(error, mono_collection) {
    if( error ) callback(error);
    else callback(null, mono_collection);
  });
};

//query validation
var lib = {
	dataValidation:function(vdata,query,insert_p){
		if(!insert_p)insert_p ={res:{},msg:{}};
		for ( var k in vdata) {
			if(query[k] instanceof Array){
				//required
				if(!query[k].length && vdata[k].req) insert_p.msg[k] = "["+k + "] : required";
				insert_p.res[k] = [];
				for ( var i = 0; i < query[k].length; i++) {
					
					if(vdata[k].match){
						if(vdata[k].match.regx && !vdata[k].match.regx.test(query[k][i])
							|| (vdata[k].match.arr && vdata[k].match.arr.indexOf(query[k][i]) === -1)
							|| (vdata[k].match.func && !vdata[k].match.func(query[k][i]))) {
							insert_p.msg[k] = vdata[k].match.msg;
							break;
						}
					}
					if(vdata[k].len && vdata[k].len[0] > query[k][i].length && vdata[k].len[1] < query[k][i].length) 
						insert_p.msg[k] = "["+k + "] : wrong length of characters";
					insert_p.res[k].push((vdata[k].convert)?vdata[k].convert(query[k][i]):query[k][i]);
				}
			}
			else{
				//required
				if(!query[k]){
					if(vdata[k].req )insert_p.msg[k] = "["+k + "] : required";
					continue;
				}
				if(vdata[k].match){
					if(vdata[k].match.regx && !vdata[k].match.regx.test(query[k])
						|| (vdata[k].match.arr && vdata[k].match.arr.indexOf(query[k]) === -1)
						|| (vdata[k].match.func && !vdata[k].match.func(query[k]))) insert_p.msg[k] = vdata[k].match.msg;
				}
				if(vdata[k].len && vdata[k].len[0] > query[k].length && vdata[k].len[1] < query[k].length) insert_p.msg[k] = "["+k + "] : wrong length of characters";
				insert_p.res[k] = (vdata[k].convert)?vdata[k].convert(query[k]):query[k];
			}
		}
		return insert_p;
	},
	convertObjectId:function(p){
		return require("mongodb").ObjectID(""+p);
	},
	getUnreadMessageAndCallback:function(db,id,res,callback){
		//user info(message from other users)
		var col_user = db.collection("mono_user");
		col_user.findOne({_id:lib.convertObjectId(id)},function(error, results) {
			res.unreadmessage = (results.message && results.message.unread)?results.message.unread:[];
			callback(null,res);
		});
	},
	convertPassword:function(p){
		return require("crypto").createHash("sha1").update(p).digest("hex");
	}
};


//add new mono
monoProvider.prototype.insertSurvey = function(data,req,callback) {
	//TODO <<<<
	_lib.log(data,"insertsurvey");
	var surveydata = data.survey;
	var cols = {
			writername: {req:1,match:{func:_lib.isValiableText,msg:"valid mono_name required"},max_length:50},
			q1: {},
			q2: {},
			q3: {},
			q4: {},
			q5: {}
		    },insert_p = {res:{inputdata:{},created_at:new Date(),datatype:1},msg:{}};
	
	for ( var k in cols) {
		
		//required
		if(cols[k].req && !surveydata[k]){
			insert_p.msg[k] = "["+k + "] : required";
		}
		if(!surveydata[k])continue;
		if(cols[k].match){
			if(cols[k].match.regx && !cols[k].match.regx.test(surveydata[k])) insert_p.msg[k] = cols[k].match.msg;
			else if(cols[k].match.arr && cols[k].match.arr.indexOf(surveydata[k]) === -1) insert_p.msg[k] = cols[k].match.msg;
			else if(cols[k].match.func && !cols[k].match.func(surveydata[k])) insert_p.msg[k] = cols[k].match.msg;
		}
		if(cols[k].len && cols[k].len[0] > surveydata[k].length && cols[k].len[1] < surveydata[k].length) insert_p.msg[k] = "["+k + "] : wrong length of characters";
		insert_p.res.inputdata[k] = (cols[k].convert)?cols[k].convert(surveydata[k]):surveydata[k];
	}
	//error
	if(Object.keys(insert_p.msg).length){
		callback(null,false);
		return;
	}
	else {
		//insert_p.res.req = req;
		//_lib.log(req._parsedUrl,"req_parsedurl");
		var url = require('url'),ip;
		insert_p.res.headers = req.headers;
		_lib.log(insert_p.res.headers,"insert_p.res.headers");
		//insert_p.res.cookies = req.cookies;
		//_lib.log(insert_p.res.cookies,"insert_p.res.cookies");
		insert_p.res.url = url.parse(req.headers.referer, true);
		_lib.log(insert_p.res.url,"insert_p.res.url");
		ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		insert_p.res.area = (geoip.lookup(ip)||"");
		insert_p.res.nwinfo = {"ip":ip};
	}
	this.getCollection_survey(function(error, survey_collection) {
		//TODO : password sha1,add created_at,required
	      if( error ) callback(error);
	      else {
	    	  survey_collection.insert(insert_p.res, function(error,results) {
	              callback(null, results);
	          });
	      }
	});
};


//TODO del
//get unread message
monoProvider.prototype.findUnreadMessage = function(ses,callback) {
	var db = this.db, col_user = db.collection("mono_user"),res = {unreadmessage:[]};
	if("undefined" != typeof ses && ses.user  && ses.user.uid){
		col_user.findOne({_id:lib.convertObjectId(ses.user.uid)},function(error, results) {
			res.unreadmessage = (results.message && results.message.unread)?results.message.unread:[];
			callback(null,res);
		});
	} 
	else {
		callback(null,res);
	}
};
//find detailed information of Mono
monoProvider.prototype.findMonoById = function(did,ses,callback) {
	var db = this.db, col_user = db.collection("mono_user"), res = {mono:{},usermono:{},unreadmessage:[]},col_mono = db.collection("mono");

	  col_mono.findOne({"_id":lib.convertObjectId(did),datatype:1},function(error, result) {
		  if( error ) callback(error);
		  else {
			  if(result){
				  if(!result.imagedata) result.imagedata = [];
				  else if(!(result.imagedata instanceof Array)){
					  result.imagedata = [result.imagedata];
				  }
				  res.mono = result;
				//get mono list that user uploaded for exchange
				  if("undefined" != typeof ses && ses.user  && ses.user.uid){
    					col_mono.find({"writer_id":lib.convertObjectId(ses.user.uid)}).toArray(function(error, results) {
    						_lib.log(results,"rrreeesssuulltttsss");
		      	      		  if( error ) callback(error);
		      	      		  else if(results.length){
	      	      				  res.usermono = results;
	      	      			  }
		      	      		  //user info(message from other users)
      	      				  lib.getUnreadMessageAndCallback(db,ses.user.uid,res,callback);
		      	        });
				  }
				  else callback(null, res);
			  }
			  else {
    			  callback(null, false);
			  }
		  }
  });
};





//find mono by category
monoProvider.prototype.findMonoByCategory = function(p_category,ses,callback) {
	var db = this.db, col_mono = db.collection("mono"),res = {unreadmessage:[]},i=0,id,category = jsdata.data.category;
	  for (; i < category.length; i++) {
		  if(category[i].name == p_category){
			  id = lib.convertObjectId(category[i].id);
			  break;
		  }
	  }
	  col_mono.find({datatype:1,category: id }).sort({mono_name:1}).toArray(function(error, results) {
		  if( error ) callback(error);
		  else {
			  //set mono data
			  res.mono = results;
			  if("undefined" != typeof ses && ses.user  && ses.user.uid){
				  lib.getUnreadMessageAndCallback(db,ses.user.uid,res,callback);
			  }
			  else callback(null, res);
		  };
	  });
};

//find random mono
monoProvider.prototype.findMonoByRandom = function(callback) {
	var db = this.db, col_mono = db.collection("mono"),res = {unreadmessage:[]},limit = 20;
	col_mono.count(function(error,results){
		_lib.log(results,"count");
		if( error ) callback(error,false);
		else {
			col_mono.find().limit(limit).skip(Math.floor(Math.random()*limit)).toArray(function(error, results) {
				  if( error ) callback(error);
				  else {
					  //set mono data
					  res.mono = results;
					  if("undefined" != typeof ses && ses.user  && ses.user.uid){
						  lib.getUnreadMessageAndCallback(db,ses.user.uid,res,callback);
					  }
					  else callback(null, res);
				  };
			});
		}
	});
};

//findUserInformation
monoProvider.prototype.findUserInformation = function(uid,ses,callback) {
	var db = this.db, col_user = db.collection("mono_user"), col_mono = db.collection("mono"),res = {},i=0;
	  col_user.find({datatype:1,_id: lib.convertObjectId(uid) }).toArray(function(error, results) {
		  if( error || !results.length) callback(error);
		  else {
			  //set user data
			  res.user = results[0];
			  col_mono.find({datatype:1,writer_id: lib.convertObjectId(uid) }).sort({created_at:1}).toArray(function(error, results) {
	      		  if( error ) callback(error);
	      		  else {
	      			  //set user data
	      			  res.mono = results;
	      			  if("undefined" != typeof ses && ses.user  && ses.user.uid){
	      				  lib.getUnreadMessageAndCallback(db,ses.user.uid,res,callback);
	      			  }
	      			  else callback(null, res);
	      		  };
	      	  });
		  };
	  });
};

//findUserByEmailOrUserId
monoProvider.prototype.findUserByEmailOrUserId = function(p,callback) {
	var db = this.db, col_user = db.collection("mono_user"),q={datatype:1};
	if(_lib.isMail(p.session.username_or_email)){
		  q.email = p.session.username_or_email;
	  }
	  else q.screen_name = p.session.username_or_email;
	  q.user_password = require("crypto").createHash("sha1").update(p.session.password).digest("hex");
	  col_user.find(q).toArray(function(error, results) {
		  if( error ) callback(error);
		  else {
			  //set mono data
			  callback(null, (results.length)?{screen_name:results[0].screen_name,uid:results[0]._id}:false);  
		  };
	  });
};
//<<<<<<<<<<<<
//updateLikeDislike
monoProvider.prototype.updateLikeDislike = function(mid,data,callback) {
	if(!_lib.isID(mid)){
		callback(false);
	}
	else{
		var db = this.db, col_mono = db.collection("mono");
		col_mono.findOne({_id:lib.convertObjectId(mid)},function(error, result) {
			if( error || !result ) callback(false);
			else {
				if(data.like){
					if(result.like && result.like.length){
						//already added like
						if(result.like.indexOf(data.like) != -1){
							callback(false);
						}
						else {
							col_mono.update({_id:lib.convertObjectId(mid)},{$push:{"like":data.like}}, function(error,results) {
					              if (error){ callback(false); } 
					              else { callback(true); }
							});
						}
					}
					else {
						col_mono.update({_id:lib.convertObjectId(mid)},{$push:{"like":data.like}}, function(error,results) {
				              if (error){ callback(false); } 
				              else { callback(true); }
						});
					}
				}
				else if(data.dislike){
					if(result.dislike && result.dislike.length){
						//already added dislike
						if(result.dislike.indexOf(data.dislike) != -1){
							callback(false);
						}
						else {
							//result.dislike.push(data.dislike)
							//db.mono.update({"_id" : ObjectId("52f82c1e0d5be90902000001")},{$push:{tag:"tg2"}});
							col_mono.update({_id:lib.convertObjectId(mid)},{$push:{"dislike":data.dislike}}, function(error,results) {
					              if (error){ callback(false); } 
					              else { callback(true); }
							});
						}
					}
					else {
						//add [data.dislike]
						col_mono.update({_id:lib.convertObjectId(mid)},{$push:{"dislike":data.dislike}}, function(error,results) {
				              if (error){ callback(false); } 
				              else { callback(true); }
						});
					}
				}
				else { //no data.like & data.dislike
					callback(false);
				}
			};
		});
	}
};




//update mono
monoProvider.prototype.updateMono = function(monodata,ses,callback) {
	var allImg = [],i=0,ml=0,data_mono = monodata.mono;
	for (i = 0,ml = ((data_mono.imagedata)?data_mono.imagedata.length:0); i < ml; i++) {
		//_lib.log(data_mono.imagedata,"data_mono.imagedata");
		if(!_lib.isIMGFile(data_mono.imagedata[i]))continue;
		allImg.push({"imagedata":data_mono.imagedata[i]});
	}
	for (i = 0,ml = ((data_mono.imageurl)?data_mono.imageurl.length:0); i < ml; i++) {
		//_lib.log(data_mono.imageurl,"data_mono.imageurl");
		if(!_lib.isIMGURL(data_mono.imageurl[i]))continue;
		allImg.push({"imageurl":data_mono.imageurl[i]});
	}
	for (i = 0,ml = ((data_mono.imageyoutube)?data_mono.imageyoutube.length:0); i < ml; i++) {
		//_lib.log(data_mono.imageyoutube,"data_mono.imageyoutube");
		if(!_lib.isYoutubeID(data_mono.imageyoutube[i]))continue;
		allImg.push({"imageyoutube":data_mono.imageyoutube[i]});
	}
	_lib.log(allImg,"allImg");
	var cols = {
			mono_name: {req:1,match:{func:_lib.isValiableText,msg:"valid mono_name required"},max_length:50},
			//TODO add validation file size,,
			state: {req:1},
			city: {req:1},
			category: {req:1,match:{regx:/^[0-9a-zA-Z_]{24,24}$/,msg:"valid category required"},convert:lib.convertObjectId/*function(p){return require("mongodb").ObjectID(""+p)}*/},
			/*
			imagedata: {match:{func:_lib.isIMGFile,msg:"valid Image (jpeg|png|jpg|bmp , maxsize (300k)) file required"}},
			imageurl: {match:{func:_lib.isIMGURL,msg:"valid Image URL required"}},
			imageyoutube: {match:{func:_lib.isYoutubeID,msg:"valid youtube id required"}},
		    */
			exchangewish: {match:{match:_lib.isValiableText,msg:"valid exchangewish required"},convert:_lib.splitString},
		    tag: {match:{match:_lib.isValiableText,msg:"valid tag required"},convert:_lib.splitString},
		    about_mono: {req:1,match:{func:_lib.isValiableText,msg:"valid about_mono required"},max_length:500}
		    },insert_p = {res:{update_at:new Date(),images:allImg},msg:{},_id:lib.convertObjectId(monodata.mono.id)};
	
	for ( var k in cols) {
		
		//required
		if(cols[k].req && !monodata.mono[k]){
			insert_p.msg[k] = "["+k + "] : required";
		}
		if(!monodata.mono[k])continue;
		if(cols[k].match){
			if(cols[k].match.regx && !cols[k].match.regx.test(monodata.mono[k])) insert_p.msg[k] = cols[k].match.msg;
			else if(cols[k].match.arr && cols[k].match.arr.indexOf(monodata.mono[k]) === -1) insert_p.msg[k] = cols[k].match.msg;
			else if(cols[k].match.func && !cols[k].match.func(monodata.mono[k])) insert_p.msg[k] = cols[k].match.msg;
		}
		if(cols[k].len && cols[k].len[0] > monodata.mono[k].length && cols[k].len[1] < monodata.mono[k].length) insert_p.msg[k] = "["+k + "] : wrong length of characters";
		insert_p.res[k] = (cols[k].convert)?cols[k].convert(monodata.mono[k]):monodata.mono[k];
	}
	//error
	if(Object.keys(insert_p.msg).length){
		_lib.log(insert_p.msg,"mono insert fail");
		callback(null,false);
		return;
	}
	this.getCollection_mono(function(error, mono_collection) {
		//TODO : password sha1,add created_at,required
	      if( error ) callback(error);
	      else {
	    	  _lib.log(insert_p.res,"updateMono");
	    	  insert_p.res.datatype = 1;
	    	  mono_collection.update({_id:lib.convertObjectId(monodata.mono.id)},{$set:insert_p.res}, function(error,results) {
	              callback(null, (error)?false:true);
	          });
	          
	      }
	});
};

//add new comment
monoProvider.prototype.insertComment = function(data,ses,callback) {
	_lib.log(data,"insertComment_data");
	/*
	{ comment:
      { monoid: '52df12b33f130adda5db1935', //target mono to add comment
        exchange_wish: '53324e23adafb8a401000001:mn22_update', //exchange_wish:mono_name
        message: 'sa' } },
        
        { 	"writer" : "username09", 	
        "writer_id" : ObjectId("52d7289a4c5461e701000001"), 	
        "message" : "comment1", 	
        "created_at" : ISODate("2014-01-22T00:36:09.883Z") }
	*/
	if(!_lib.isID(data.comment.monoid)){
		callback(null,false);
	}
	else{
		/*var ew_mn = data.comment.exchange_wish.split(":");
		data.comment.exchange_wish = ew_mn[0];
		data.comment.mono_name = ew_mn[1];*/
		//convert data [exchange_wish id:mono_name] => {exchange_wish id:mono_name}
		for ( var i = 0,ew_arr = {},to; i < data.comment.exchange_wish.length; i++) {
			
			to = data.comment.exchange_wish[i].split(":");
			if(!_lib.isID(to[0]) || !to[1])continue;
			ew_arr[to[0]] = to[1];
		}
		
		
		var cols = {
			    //exchange_wish: {match:{func:_lib.isID,msg:"valid exchange wish required"},convert:lib.convertObjectId},
			    //mono_name: {req:1},
			    message: {convert:_lib.htmlEncoding}
			}, insert_p = {res:{writer:ses.user.screen_name,writer_id:lib.convertObjectId(ses.user.uid),exchange_wish:ew_arr,create_at:new Date()},msg:{}};
		//TODO apply dataValidation to other inserts
		insert_p = lib.dataValidation(cols, data.comment, insert_p);
		_lib.log(insert_p,"insert_p");
		//callback(null,false);

		//error
		if(Object.keys(insert_p.msg).length){
			callback(null,false);
		}
		else this.getCollection_mono(function(error, mono_collection) {
			//TODO : password sha1,add created_at,required
		      if( error ) callback(error);
		      else {
		    	  //db.t.update({ "_id" : "2"},{ $push: { 'workspace.$.widgets' : { id: "2", blabla: "blabla" } } });
		    	  mono_collection.update({_id:lib.convertObjectId(data.comment.monoid)},{$push:{"comment":insert_p.res}}, function(error,results) {
		              callback(null, results);
		          });
		      }
		});
	}
};

//sendMessage
monoProvider.prototype.sendMessage = function(data,callback) {
	var cols = {
		    title: {convert:_lib.htmlEncoding},
		    message: {convert:_lib.htmlEncoding}
		}, insert_p = {res:{from_screen_name:data.sesuser.screen_name,from_id:lib.convertObjectId(data.sesuser.uid),create_at:new Date()},msg:{}};
	//TODO apply dataValidation to other inserts
	insert_p = lib.dataValidation(cols, data.msg, insert_p);
	//error
	if(Object.keys(insert_p.msg).length){
		callback(0);
	}
	else this.getCollection_user(function(error, mono_collection) {
	      if( error ) callback(error);
	      else {
	    	  mono_collection.update({_id:lib.convertObjectId(data.msg.sendTo)},{$push:{"message.unread":insert_p.res}}, function(error,results) {
	    		  callback(( error )?0:1);
	    	  });
	      }
	});
};

//deleteMono
monoProvider.prototype.deleteMono = function(data,callback) {
	var insert_p = {res:{datatype:0,update_at:new Date()},msg:{}};
	this.getCollection_mono(function(error, mono_collection) {
	      if( error ) callback(error);
	      else {
	    	  mono_collection.update({_id:lib.convertObjectId(data.id),writer_id:lib.convertObjectId(data.sesuser.uid)},{$set:insert_p.res}, function(error,results) {
	    		  callback(( error )?0:1);
	    	  });
	      }
	});

};

//add message
monoProvider.prototype.addMessage = function(data,ses,callback) {
	if(!_lib.isID(data.comment.monoid)){
		callback(null,false);
	}
	else{
		var cols = {
				writer_id: {req:1,match:{func:_lib.isID,msg:"valid exchange wish required"},convert:lib.convertObjectId},
			    writer: {req:1,convert:_lib.htmlEncoding},
			    message: {req:1,convert:_lib.htmlEncoding}
			}, insert_p = {res:{writer:ses.user.screen_name,writer_id:lib.convertObjectId(ses.user.uid),create_at:new Date()},msg:{}};
		//TODO apply dataValidation to other inserts
		insert_p = lib.dataValidation(cols, data.comment, insert_p);
		_lib.log(insert_p.res,"insert_p.res");
		//callback(null,false);

		//error
		if(Object.keys(insert_p.msg).length){
			callback(null,false);
		}
		else this.getCollection_user(function(error, mono_collection) {
			//TODO : password sha1,add created_at,required
		      if( error ) callback(error);
		      else {
		    	  //db.t.update({ "_id" : "2"},{ $push: { 'workspace.$.widgets' : { id: "2", blabla: "blabla" } } });
		    	  mono_collection.update({_id:lib.convertObjectId(data.message.receiver_id)},{$push:{"message":insert_p.res}}, function(error,results) {
		              callback(null, results);		              
		          });
		      }
		});
	}
};

//add new user
monoProvider.prototype.insertUser = function(userdata,callback) {
	var cols = {
			email: {req:1,match:{wid:/\S+@\S+\.\S+/.test,msg:"valid email required"},max_length:50},
			/*
			 * (/^
			 *  (?=.*\d)                //should contain at least one digit
			 *  (?=.*[a-z])             //should contain at least one lower case
			 *  (?=.*[A-Z])             //should contain at least one upper case
			 *  [a-zA-Z0-9]{8,}         //should contain at least 8 from the mentioned characters
			 * $/)
			 */
		    user_password: {req:1,match:{wid:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/,msg:"valid password required"}},
		    screen_name: {req:1,match:{wid:/^[0-9a-zA-Z_]{2,20}$/,msg:"valid screen_name required"}},
		    
		    gender: {match:{wid:["0","1"],msg:"valid gender required"}},
		    birthyear: {match:_lib.isNumber,len:[3,4]},
		    state: {len:[2,50]},
		    city: {len:[2,50]}
		    //remember_me_on_signup: {req:1,equal:1}
		    	},insert_p = {res:{datatype:1},msg:{}};
	
	for ( var k in cols) {
		
		//required
		if(cols[k].req && !userdata.user[k]){
			insert_p.msg[k] = "["+k + "] : required";
		}
		if(!userdata.user[k])continue;
		if(cols[k].match){
			if(cols[k].match.wid instanceof RegExp && !cols[k].match.wid.test(userdata.user[k])){
				_lib.log(cols[k].match.wid,"cols[k].match.wid");
				_lib.log(userdata.user[k],"userdata.user[k]");
				 insert_p.msg[k] = cols[k].match.msg;
			}
			else if(cols[k].match.wid instanceof Array && cols[k].match.wid.indexOf(userdata.user[k]) === -1) insert_p.msg[k] = cols[k].match.msg;
		}
		if(cols[k].len && cols[k].len[0] > userdata.user[k].length && cols[k].len[1] < userdata.user[k].length) insert_p.msg[k] = "["+k + "] : wrogn length of characters";
		if(k=="user_password") insert_p.res[k] = require("crypto").createHash("sha1").update(userdata.user[k]).digest("hex");
		else insert_p.res[k] = userdata.user[k];
	}
	//error
	if(Object.keys(insert_p.msg).length){
		_lib.log(insert_p,"insertfail");
		callback(null,false);
		return;
	}
	this.getCollection_user(function(error, mono_collection) {
	      if( error ) callback(error);
	      else {
	    	  mono_collection.insert(insert_p.res, function(error,results) {
	              callback(null, results);
	          });
	      }
	});
};

//updateUserInfo
monoProvider.prototype.updateUserInfo = function(data,ses,callback) {
	var cols = {
		    user_password: {req:1,match:{wid:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/,msg:"valid password required"},convert:lib.convertPassword},
		    gender: {match:{wid:["0","1"],msg:"valid gender required"}},
		    birthyear: {match:_lib.isNumber,len:[3,4]},
		    state: {len:[2,50]},
		    city: {len:[2,50]}
		    //remember_me_on_signup: {req:1,equal:1}
		    	},insert_p = {res:{datatype:1},msg:{}};
	
	
	//<<<<
	//require("crypto").createHash("sha1").update(p.session.password).digest("hex");
	insert_p = lib.dataValidation(cols, data.user, insert_p);
	/*
	for ( var k in cols) {
		
		//required
		if(cols[k].req && !data.user[k]){
			insert_p.msg[k] = "["+k + "] : required";
		}
		if(!data.user[k])continue;
		if(cols[k].match){
			if(cols[k].match.wid instanceof RegExp && !cols[k].match.wid.test(data.user[k])){
				_lib.log(cols[k].match.wid,"cols[k].match.wid");
				_lib.log(data.user[k],"data.user[k]");
				 insert_p.msg[k] = cols[k].match.msg;
			}
			else if(cols[k].match.wid instanceof Array && cols[k].match.wid.indexOf(data.user[k]) === -1) insert_p.msg[k] = cols[k].match.msg;
		}
		if(cols[k].len && cols[k].len[0] > data.user[k].length && cols[k].len[1] < data.user[k].length) insert_p.msg[k] = "["+k + "] : wrogn length of characters";
		if(k=="user_password") insert_p.res[k] = require("crypto").createHash("sha1").update(data.user[k]).digest("hex");
		else insert_p.res[k] = data.user[k];
	}
	*/
	//_lib.log(insert_p,"insertfail2");
	//error
	if(Object.keys(insert_p.msg).length){
		_lib.log(insert_p,"insertfail");
		callback(null,false);
	}
	else {
		this.getCollection_user(function(error, mono_collection) {
		      if( error ) callback(error);
		      else {
		    	  mono_collection.update({_id:lib.convertObjectId(ses.user.uid)},{$set:insert_p.res}, function(error,results) {
		              callback(null, results);
		          });
		      }
		});
	}
};


//save new mono
monoProvider.prototype.save = function(monos, callback) {
    this.getCollection_mono(function(error, mono_collection) {
      if( error ) callback(error);
      else {
        if( typeof(monos.length)=="undefined") monos = [monos];

        for( var i =0;i< monos.length;i++ ) {
          mono = monos[i];
          mono.created_at = new Date();
        }
        //TODO : create collection if collection does not exist
        mono_collection.insert(monos, function(error) {
          callback(null, monos);
          if (error){
              _lib.log("Error : ", error.message);
          } else {
        	  _lib.log("Inserted in to database");
          }
        });
      }
    });
};

exports.monoProvider = monoProvider;