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
  ,MonoProvider = require('./data/model').monoProvider
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
var monoProvider = new MonoProvider('localhost',27017);

//Routes
//view index.ejs
//TODO display viewers list in chatting window
app.get('/', function(req, res){
	monoProvider.findUnreadMessage(req.session,function(error, result){
		res.render('index', {
	        title: 'Top',
	        session: req.session,
	        _jsdata:jsdata.data,
	        _data:result
	    });
	});
});


app.get('/questionaire', function(req, res){
	res.render('questionaire', {
        title: 'Top',
        session: req.session
    });
});

app.get('/analytics', function(req, res){
	monoProvider.getAnalyticsResult(req.body,function(error, result){
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
	monoProvider.insertSurvey(req.body,req,function(error, result){
		//res.redirect('/message?'+((result)?'signupdone':'signupfail'));
		res.render('analytics', {
            title: 'analytics',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
	});
});


//TODO:del
app.get('/mypage', function(req, res){
	//bring unloggedin user to signin page
	if(!req.session.user) {
		req.session.lastPage = "/mypage";
		res.redirect('/signin');
		return;
	}
	monoProvider.findUserInformation(req.session.user.uid,req.session,function(error, result){
		res.render('userinfo', {
            title: 'mypage',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
	});
});

app.get('/usermessage', function(req, res){
	//bring unloggedin user to signin page
	if(!req.session.user) {
		req.session.lastPage = "/mypage";
		res.redirect('/signin');
		return;
	}
	monoProvider.findUserInformation(req.session.user.uid,req.session,function(error, result){
		res.render('usermessage', {
            title: 'usermessage',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
	});
});


//show mono info
app.get('/userinfo', function(req, res){
	req.session.lastPage = req._parsedUrl.path;
	monoProvider.findUserInformation(decodeURIComponent(req.param('u')),req.session,function(error, result){
		res.render('userinfo', {
            title: 'user info',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
	});
});

//update user info
app.post('/updateUserinfo', function(req, res){
	monoProvider.updateUserInfo(req.body,req.session,function(error, result){
		//res.redirect('/message?'+((result)?'signupdone':'signupfail'));
		res.render('message', {
            title: 'message',
            session: req.session,
            _jsdata:jsdata.data,
            _data:((result)?'updateDone':'updateFail')
        });
	});
});

// show mono list by category
app.get('/category', function(req, res){
	monoProvider.findMonoByCategory(decodeURIComponent(req.param('c')),req.session,function(error, result){
      res.render('monolist', {
            title: 'category',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
  });
});

//register mono
app.get('/registration', function(req, res){
	if(!req.session.user) {
		req.session.lastPage = "/registration";
		res.redirect('/signin');
		return;
	}
	monoProvider.findUnreadMessage(req.session,function(error, result){
		res.render('registration', {
	        title: 'registration',
	        session: req.session,
	        _jsdata:jsdata.data,
	        _data:result
	    });
	});
});


//register mono
app.post('/registration', function(req, res){
	monoProvider.insertMono(req.body,req.session.user,function(error, result){
		if(result && result.length){
			res.redirect('/mono?m='+result[0]._id);
		}
		else {
			res.redirect('/');
		}
	});
});



//show mono info
app.get('/mono', function(req, res){
	req.session.lastPage = req._parsedUrl.path;
	monoProvider.findMonoById(decodeURIComponent(req.param('m')),req.session,function(error, result){
		_lib.log(result,"result");
		if(result){
			res.render('mono', {
	            title: 'category',
	            session: req.session,
	            _jsdata:jsdata.data,
	            _data:result
	        });
		}
		else {
			res.render('message', {
	            title: 'message',
	            session: req.session,
	            _jsdata:jsdata.data,
	            _data:'no mono data'
	        });
		}
	});
});

//show mono edit
app.get('/monoedit', function(req, res){
	req.session.lastPage = req._parsedUrl.path;
	if(!req.session.user) {
		res.redirect('/signin');
		return;
	}
	monoProvider.findMonoById(decodeURIComponent(req.param('m')),req.session,function(error, result){
		res.render('monoedit', {
            title: 'monoedit',
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
	});
});

//edit monoinfo
app.post('/monoedit', function(req, res){
	req.session.lastPage = req._parsedUrl.path;
	monoProvider.updateMono(req.body,req.session,function(error, result){
		if(error || !result){
			res.render('message', {
	            title: 'message',
	            session: req.session,
	            _jsdata:jsdata.data,
	            _data:'monoeditFail'
	        });
		}
		else {
			res.redirect("/mono?m="+decodeURIComponent(req.body.mono.id));
		}
	});
});

//add comment
app.post('/addcomment', function(req, res){
	monoProvider.insertComment(req.body,req.session,function(error, result){
		res.redirect((req.session.lastPage)?req.session.lastPage:"/");
	});
});

//like +1(Ajax)
app.post('/like', function(req, res){
	var url = require('url'),url_parts = url.parse(req.headers.referer, true),mid = url_parts.query.m;
	if(!req.session.user || !_lib.isID(mid)) {
		res.send("fail");
	}
	else {
		//TODO add monoProvider.insertLikeDislike
		monoProvider.updateLikeDislike(mid,{like:req.session.user.uid},function(result){
			res.send((result)?"success":"fail");
		});
	}
});

//dislike +1(Ajax)
app.post('/dislike', function(req, res){
	var url = require('url'),url_parts = url.parse(req.headers.referer, true),mid = url_parts.query.m;
	_lib.log(mid,"like_mid");
	if(!req.session.user || !_lib.isID(mid)) {
		res.send("fail");
	}
	else {
		//TODO add monoProvider.insertLikeDislike
		monoProvider.updateLikeDislike(mid,{dislike:req.session.user.uid},function(result){
			res.send((result)?"success":"fail");
		});
	}
});

//sendmessage
app.post('/sendmessage', function(req, res){
	var url = require('url'),p = req.body;
	if(!req.session.user || !req.body.title || !req.body.message || !req.body.sendTo) {
		res.send("fail");
	}
	else {
		monoProvider.sendMessage({msg:req.body,sesuser:req.session.user},function(result){
			res.send((result)?"success":"fail");
		});
	}
});

//sendmessage
app.post('/deletemono', function(req, res){
	var url = require('url'),id = req.body.id;
	if(!req.session.user || !id) {
		res.send("fail");
	}
	else {
		monoProvider.deleteMono({id:id,sesuser:req.session.user},function(result){
			res.send((result)?"success":"fail");
		});
	}
});

//signin
app.get('/signin', function(req, res){
	//monoProvider.findMonoByCategory(decodeURIComponent(req.param('c')),function(error, result){
		res.render('signin', {
	   		title: 'signin',
         	session: req.session,
         	_jsdata:jsdata.data
         	//_data:result
		});
	//});
});

app.post('/signin', function(req, res){
	var p = req.body;
	if(!p.session || !p.session.username_or_email || !p.session.password) {
		res.render('signin', { 
			title: 'message',
			_jsdata:jsdata.data,
			_data:'signupfail'
			 });
		return;
	}
	//store cookie
	if(p.remember_me){
		
	}
	monoProvider.findUserByEmailOrUserId(p,function(error, result){
		if (result){
			//TODO : user session start
			req.session.user = result;
			if(req.session.lastPage){ res.redirect(req.session.lastPage);}
			else res.redirect('/');
		}
		else res.render('signin', { 
			title: 'signin', 
			session: req.session, 
			_jsdata:jsdata.data,
			_data:('signupfail') 
		});
	});
});
app.get('/signout', function(req, res){
	req.session.user = false;
	res.redirect('/');
});


//signup view
app.get('/signup', function(req, res){
	res.render('signup', {
        title: 'signup',
        session: req.session,
        _jsdata:jsdata.data
    });
});
//signup
//TODO : fail -> back to signup page with errmsg
app.post('/signup', function(req, res){
	monoProvider.insertUser(req.body,function(error, result){
		//res.redirect('/message?'+((result)?'signupdone':'signupfail'));
		var render = (req.session.lastPage)?req.session.lastPage:"index"; 
		res.render(render, {
            title: 'message',
            session: req.session,
            _jsdata:jsdata.data,
            _data:((result)?'signupdone':'signupfail')
        });
	});
});

//show mono list by category
app.get('/search', function(req, res){
	
	var url = require('url'),url_parts = url.parse(req.url, true),query = url_parts.query;
	monoProvider.findMonoBySearch(query,req.session,function(error, result){
      res.render('monolist', {
            title: 'search',
            query:query,
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
  });
});

//findMonoByRandom
app.get('/random', function(req, res){
	
	var url = require('url'),url_parts = url.parse(req.url, true),query = url_parts.query;
	monoProvider.findMonoByRandom(function(error, result){
      res.render('monolist', {
            title: 'search',
            query:query,
            session: req.session,
            _jsdata:jsdata.data,
            _data:result
        });
  });
});

//TODO //view admin.ejs


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
