
var async = require('async');
var mongoose = require('mongoose');
var User = require('../user/user.model');

require("./friend.socket"); // registering (This will be in config/socketio.js )

var eventEmitter = require('../../components/EventEmitter');

exports.send = function(req, res) {
  var rcverId = req.params.id;
  var senderId = req.user._id;

	async.parallel({
		 From: function(callback){ // update sender profile
	        
	        var conditions = {
	        	$and: [ 
	        		{ _id: senderId },	        		
	        		{ 
	        			'friends.sent.data.who': {
			            	$ne: mongoose.Types.ObjectId(rcverId)
			        	}  
			        } 
	        	]
	        };

	        User.findOne(conditions).exec(function (err, sender) {
	        	if(err)
	        		return callback(err);

	        	else if(!sender)
	        		return callback("Already Sent Request");

	        	sender.friends.sent.data.push({ 'who' : rcverId });
	        	sender.save(function(err, doc){
	        		if(err)
	        			return callback(err);
	        		return callback(null, doc);
	        	});
	        });

	    },
	    To: function(callback){ // update rcver profile
	        	        
	        var conditions = {
	        	$and: [ 
	        		{ _id: rcverId },	        		
	        		{ 
	        			'friends.rcved.data.who': {
			            	$ne: mongoose.Types.ObjectId(senderId)
			        	}  
			        } 
	        	]
	        };
	        	        
	        User.findOne(conditions).exec(function (err, rcver) {
	        	if(err)
	        		return callback(err);

	        	else if(!rcver)
	        		return callback("Already Rcved Request");

	        	rcver.friends.rcved.data.push({ 'who' : senderId });

	        	rcver.save(function(err, doc){
	        		if(err)
	        			return callback(err);
	        		return callback(null, doc);
	        	});
	        });

	    }	   
	},
	function(err, results) {
		if(err)
			return res.status(500).send(err);

		console.log("EventEmitter:FRND_REQUEST_RCVED");		
		eventEmitter.emit('FRND_REQUEST_RCVED', results);

		return res.status(201).json(results);
	});

};


exports.find = {
	confirm : function(id,callback){

		User.findOne({ _id : id }).select("-friends.rcved -friends.sent").exec(function(err,user){        
			var friends = user.friends.confirm.data.map(function(obj){
				return obj.who.toString();
			});
			callback(friends, user.chatInfo);
		});		

	}
};

