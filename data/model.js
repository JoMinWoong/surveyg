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
	com = require("../lib/common"),_lib = com.lib,geoip = require('geoip-lite'),
dataProvider = function(host, port) {
  this.db= new Db("surveyg", new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

dataProvider.prototype.getCollection_user= function(callback) {
  this.db.collection("user", function(error, mono_collection) {
    if( error ) callback(error);
    else callback(null, mono_collection);
  });
};

dataProvider.prototype.getCollection_survey= function(callback) {
  this.db.collection("survey", function(error, mono_collection) {
    if( error ) callback(error);
    else callback(null, mono_collection);
  });
};

dataProvider.prototype.getCollection_log_access_survey= function(callback) {
	this.db.collection("log_access_survey", function(error, mono_collection) {
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
		try {
			return require("mongodb").ObjectID(""+p);
		} catch (e) {
			return "";
		}
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

//logging survey access
dataProvider.prototype.getSurveyForm = function(req,callback) {
	_lib.log(req.query,"log req");
	//add log
	var db = this.db, ip,k,ck={},log = {};
	log.headers = req.headers;

	//replace "." in cookie key into "_"
	for ( k in req.cookies) {
		ck[k.replace(/\./g,"_")] = req.cookies[k];
	}
	log.cookies = ck;
	//log.url = url.parse(req.headers.host+req.originalUrl, true);
	log.url = req.headers.host+req.originalUrl;
	log.query = req.query;
	ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	log.area = (geoip.lookup(ip)||{});
	log.nwinfo = {"ip":ip};
	log.agent = require('useragent').parse(req.headers['user-agent']);
	
	log.created_at = new Date();
	this.getCollection_log_access_survey(function(error, survey_collection) {
		//TODO : password sha1,add created_at,required
	      if( error ) callback(error);
	      else {
	    	  survey_collection.insert(log, function(error,results) {
	    		  if(error){
	    			  if(error){callback(error,false);}
	    		  }
	    		  else {
	    			  //get questionaireform data to generate on page
	    			  db.collection("questionaireform").findOne({_id:lib.convertObjectId(req.query.pid)},function(error,result){
	    				  if(error){callback(error,false);}
	    				  else {
			    			  callback(null, result); 
	    				  }
		    		  }); 
	    		  }
	          });
	      }
	});
};

//add new mono
dataProvider.prototype.insertSurvey = function(data,req,callback) {
	//TODO <<<<
	
	var cols = {
			writername: {req:1,match:{func:_lib.isValiableText,msg:"valid mono_name required"},max_length:50},
			q1: {},
			q2: {},
			q3: {},
			q4: {},
			q5: {}
		    },
		    //insert_p = {res:{inputdata:surveydata,pid:data.pid,created_at:new Date(),datatype:1},msg:{}};
		    //insert_p = {res:{inputdata:surveydata,pid:data.pid,created_at:new Date(),datatype:1},msg:{}};
			insert_p = {res:data,msg:{}};
			insert_p.res.created_at = new Date();
			insert_p.res.datatype = 1;
			//TODO >>>>>>>>>>>>>>>>>>>>>>>>>>>> datagropu -> inputdata 
	//TODO validation check
	/*
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
	*/
	//error
	if(Object.keys(insert_p.msg).length){
		callback(null,false);
		return;
	}
	else {
		//add log
		var url = require('url'),ip,k,ck={};
		insert_p.res.headers = req.headers;

		//replace "." in cookie key into "_"
		for ( k in req.cookies) {
			ck[k.replace(/\./g,"_")] = req.cookies[k];
		}
		insert_p.res.cookies = ck;
		insert_p.res.url = url.parse(req.headers.referer, true);
		
		ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		insert_p.res.area = (geoip.lookup(ip)||{});
		insert_p.res.nwinfo = {"ip":ip};
		insert_p.res.surveyinfo = data.surveyinfo;
		insert_p.res.created_at = new Date();
	}
	this.getCollection_survey(function(error, survey_collection) {
		//TODO : password sha1,add created_at,required
	      if( error ) callback(error);
	      else {
	    	  survey_collection.insert(insert_p.res, function(error,results) {
	    		  if(results){
	    			  
	    		  }
	              callback(null, results);
	          });
	      }
	});
};

//get analyticsresult
dataProvider.prototype.getAnalyticsResult = function(reqdata, query, callback){
	var db = this.db, col_survey = db.collection("survey"),col_log_access_survey = db.collection("log_access_survey"),res = {unreadmessage:[]};
	var mapFunction = function() {
		for ( var k in this.inputdata) {
			emit(k, {
				count : 1,
				data : this.inputdata[k]
			});
		}
	};
	var reduceFunction = function(key, countObjVals) {
		reducedVal = {
			count : 0,
			data : {}
		};

		for ( var idx = 0; idx < countObjVals.length; idx++) {
			reducedVal.count += countObjVals[idx].count;
			for ( var k in countObjVals[idx].data) {
				if (!reducedVal.data[k]) {
					reducedVal.data[k] = {};
				}
				if (reducedVal.data[k][countObjVals[idx].data[k]]) {
					reducedVal.data[k][countObjVals[idx].data[k]]++;
				} else {
					reducedVal.data[k][countObjVals[idx].data[k]] = 1;
				}
			}
			// reducedVal.qty += countObjVals[idx].data;
		}
		printjson(reducedVal);
		return reducedVal;
	};
	db.collection("questionaireform").findOne({_id:lib.convertObjectId(query.pid),datatype:1},function(error,qf){
		for ( var i = 0,questionform = {}; i < qf.input.length; i++) {
			questionform[qf.input[i]._id] = qf.input[i];
			
		}
		_lib.log(questionform,"questionform");
		var reportsubject = [];
		col_survey.mapReduce(mapFunction, reduceFunction, { out : "result_test1", query : { datatype : 1 } },
			      function(error, results, stats) {   // stats provided by verbose
					var mapFunction2 = function() {
						emit(this._id, {count:this.value.count,data:this.value.data[0]});
					};
					var reduceFunction2 = function(key, data) {
						return {key:key, data:data};
					};
					var res = {};
					//get question report
					db.collection("result_test1").mapReduce(mapFunction2, reduceFunction2, { out : "result_test2", query : {} },
						function(error, results, stats){
							db.collection("result_test2").find().toArray(function(error, results){
								if(error){callback(error,false);}
								else {
									//PV : db.log_access_survey.find().count()
									col_log_access_survey.find().count(function(error,pv){
										if(error){callback(error,false);}
										else {
											//SU : db.survey.distinct('cookies.connect_sid')
											col_survey.distinct('cookies.connect_sid',function(error, su){
												if(error){callback(error,false);}
												else {
													//TODO useragent : db.log_access_survey.aggregate({$group:{_id:"$agent.family",count:{$sum:1}}})
													col_log_access_survey.aggregate({$group:{_id:"$agent.family",count:{$sum:1}}},function(error,ua){
														if(error){callback(error,false);}
														else {
															col_survey.distinct('cookies.connect_sid',function(error, su){
																if(error){callback(error,false);}
																else {
																	//TODO useragent : db.log_access_survey.aggregate({$group:{_id:"$agent.family",count:{$sum:1}}})
																	col_survey.aggregate({$group:{_id:"$area.city",count:{$sum:1}}},function(error,area){
																		if(error){callback(error,false);}
																		else {
																			res.inputdata = results;
																			res.pv = pv;
																			res.su = su.length;
																			res.ua = ua;
																			res.area = area;
																			callback(null,res);
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					);
			      }
		);
		
	});
};



//TODO del
//find random mono
dataProvider.prototype.findMonoByRandom = function(callback) {
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

//update mono
dataProvider.prototype.updateMono = function(monodata,ses,callback) {
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


exports.dataProvider = dataProvider;