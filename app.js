/**
 * Module dependencies.
 */

/*
 * TODO
 * add category select bar searchbar
 * 
 */
var express = require('express')
  ,routes = require('./routes')
  //, user = require('./routes/user')
  ,http = require('http')
  ,path = require('path')
  ,com = require("./lib/common")
  ,_lib = com.lib
  ,url = require("url")
  ,viewerProvider = require('./viewerdata').viewerProvider
  ,DataProvider = require('./data/model').dataProvider
  ,jsdata = require("./data/jsdata")
  ,_data = {},admin;

	_data.url = {};
	_data.viewers = {};

var app = express();
app.enable('trust proxy');
app.set("trust proxy", true);
//express session
app.use(express.cookieParser());
app.use(express.session({secret: 'h2Y5ecret1sS2cret'}));

app.configure(function(){
  app.set('port', process.env.PORT || 50000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  //app.use(expressValidator([]));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  //define relative directory called by view page
  app.use(express.static(path.join(__dirname, 'public')));
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var viewerProvider = new viewerProvider('localhost', 27017);
var dataProvider = new DataProvider('localhost',27017);

//Routes
//view index.ejs
//TODO display viewers list in chatting window
app.get('/', function(req, res){
	dataProvider.findUnreadMessage(req.session,function(error, result){
		res.render('index', {
	        title: 'Top',
	        session: req.session,
	        _jsdata:jsdata.data,
	        _data:result
	    });
	});
});


app.get('/questionaire', function(req, res){
	dataProvider.getSurveyForm(req,function(error, result){
		if(error) {
			res.redirect('/message?fail');
		}
		else {
			res.render('questionaire', {
				title: 'Top',
				session: req.session
			});
		}
	});
});


app.get('/questionaireform', function(req, res){
	dataProvider.getSurveyForm(req,function(error, result){
		if(error) {
			res.redirect('/message?fail');
		}
		else if(!result) {
			res.render('message', {
				title:'message',
				message:'[87106]no form'
			});
		}
		else {
			res.render('questionaireform', {
				title: 'Top',
				data:result,
				session: req.session
			});
		}
	});
});

//individualresult
app.get('/individualreport', function(req, res){
	dataProvider.getIndividualReport(req.body,req.query,function(error, result){
		_lib.log(result,"individualreport result");
		res.render('individualreport', {
			title: 'individualreport',
			session: req.session,
			_jsdata: jsdata.data,
			data: result
		});	
	});
});


app.get('/analytics', function(req, res){
	dataProvider.getAnalyticsReport(req.body,req.query,function(error, result){
		_lib.log(result,"analytics result");
		res.render('analytics', {
			title: 'analytics',
			session: req.session,
			_jsdata: jsdata.data,
			data: result
		});	
	});
});

//submitsurvey
app.post('/submitsurvey', function(req, res){
	//_lib.log(req,"req");
	//_lib.log(res,"res");
	dataProvider.insertSurvey(req.body,req,function(error, result){
	if(error) {
		res.redirect('/message?'+((result)?'signupdone':'signupfail'));
	}
	else {
		res.redirect('/analytics?pid='+req.body.pid);
	}
	});
});



var io = require("socket.io").listen(app.listen(50000));

io.sockets.on("connection", function (socket) {
	if(socket) socket.emit("message", { message: "welcome to the chat",data:_data.viewers });
//set url data
	socket.on("query", function(p) {
		var u = (typeof p.url == "string")?p.url:p.url.href,pu,cd = {},i;
		if(_data.viewers[u]){
			if(_data.viewers[u][socket.id])
				_data.viewers[u][socket.id].start = new Date();
			else
				_data.viewers[u][socket.id] = {start:new Date()};
		}
		else {
			_data.viewers[u] = {};
			_data.viewers[u][socket.id] = {start:new Date()};
		}
		socket.t_url = u;
		pu = url.parse(u);
		if(!_data.url[p.url])_data.url[p.url] = [p.ci];
		else _data.url[p.url].push(p.ci);
		if (_lib.getQuery(pu.query,"t") == "admin")admin = p.ci;
		//send customer count to every u
		for(i in _data.url){cd[i]=_data.url[i].length;}
		io.sockets.emit("viewerdata", {data: _data.viewers});
	});
	//TODO send message sent by eu to other eu & save data to mongodb
    socket.on("send", function (data) {
		if(data.clientid == admin || data.mt == "all")io.sockets.emit("message",data);
		else if(data.mt == "admin"){
			io.sockets.socket(data.clientid).emit("message",data);
			if(admin)io.sockets.socket(admin).emit("message",data);
		}
		else {
			io.sockets.socket(data.clientid).emit("message",data);
			io.sockets.socket(data.mt).emit("message",data);
		}
		//data.messagetext , url
		viewerProvider.save({
	        url: data.url,
	        message: data.messagetext,
	        date: new Date(),
	        to: data.mt
	    }, function( error, docs) {
	        _lib.log(error,"error on ViewerProvider.save");
	    });
    });
//fire when disconnected
    socket.on("disconnect", function () {
    	if("undefined" == typeof _data || !_data.url)return;
    	//console.log(socket.t_url);
    	if(_data.viewers[socket.t_url]) delete _data.viewers[socket.t_url][socket.id];
    	//TODO : send viewer data -> analyze data -> pass result to client page
    	io.sockets.emit("viewerdata", {data: _data.viewers});

    });
});
