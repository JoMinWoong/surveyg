var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var com = require("./lib/common")
,_lib = com.lib;

viewerProvider = function(host, port) {
  this.db= new Db('node-mongo-viewer', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

viewerProvider.prototype.getCollection= function(callback) {
  this.db.collection('viewers', function(error, viewer_collection) {
    if( error ) callback(error);
    else callback(null, viewer_collection);
  });
};

//find all viewers
viewerProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, viewer_collection) {
      if( error ) callback(error)
      else {
    	//db.viewers.find()
        viewer_collection.find().sort({url:-1}).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//save new viewer
viewerProvider.prototype.save = function(viewers, callback) {
    this.getCollection(function(error, viewer_collection) {
      if( error ) callback(error)
      else {
        if( typeof(viewers.length)=="undefined") viewers = [viewers];

        for( var i =0;i< viewers.length;i++ ) {
          viewer = viewers[i];
          viewer.created_at = new Date();
        }
        /*
        client.createCollection("docs", function(err, col) {
            client.collection("docs", function(err, col) {
                for (var i = 0; i < 100; i++) {
                    col.insert({c:i}, function() {});
                }
            });
       });
       */
        //TODO : create collection if collection does not exist
        viewer_collection.insert(viewers, function(error) {
          callback(null, viewers);
          if (error){
              _lib.log("Error : ", error.message);
          } else {
        	  _lib.log("Inserted in to database");
          }
        });
      }
    });
};

exports.viewerProvider = viewerProvider;