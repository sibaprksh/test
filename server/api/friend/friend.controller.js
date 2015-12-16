
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
	        			'friends.data.who': {
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

	        	sender.friends.sent += 1;
	        	sender.friends.data.push({ 'who' : rcverId, status : 'sent', sent : Date.now() });

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
	        			'friends.data.who': {
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

	        	//rcver.friends.rcved.data.push({ 'who' : senderId });
	        	rcver.friends.rcved += 1;
	        	rcver.friends.data.push({ 'who' : senderId, status : 'rcved', rcved : Date.now() });

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

exports.accept = function(req, res){

	var whose = req.params.id;
  	var who = req.user._id;


  	async.parallel({
		 who: function(callback){ // update receiver

		 	var conditions = {	        	
	        	_id: who ,	        		
	        	'friends.data.who': whose,
			    'friends.data.status' : 'rcved'			        
	        };

		 	User.findOne(conditions).exec(function (err, accepter) {
	        	if(err)
	        		return callback(err);

	        	if(!accepter)
	        		return callback("No Received Request Found");

	        	var index;
	        	for(var i=0 ; i < accepter.friends.data.length; i++){
	        		if(accepter.friends.data[i].who.toString() == whose){
	        			index = i;
	        			break;
	        		}
	        	}

	        	accepter.friends.confirm += 1;
	        	accepter.friends.rcved -= 1;
	        	accepter.friends.data[index].status = "confirm";
	        	accepter.friends.data[index].confirm = Date.now();

	        	accepter.save(function(err, doc){
	        		if(err)
	        			return callback(err);
	        		return callback(null, doc);
	        	});

	        });

		 },	
		 whose: function(callback){ // update sender
		 	var conditions = {
	        	_id: whose ,	        		
	        	'friends.data.who': who,
			    'friends.data.status' : 'sent'			    
	        };

			User.findOne(conditions).exec(function (err, sender) {
	        	if(err)
	        		return callback(err);

	        	if(!sender)
	        		return callback("No Sender Request Found");

	        	
	        	var index;
	        	for(var i=0 ; i < sender.friends.data.length; i++){
	        		if(sender.friends.data[i].who.toString() == who){
	        			index = i;
	        			break;
	        		}
	        	}

	        	sender.friends.confirm += 1;
	        	sender.friends.sent -= 1;
	        	sender.friends.data[index].status = "confirm";
	        	sender.friends.data[index].confirm = Date.now();

	        	sender.save(function(err, doc){
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

		console.log("EventEmitter:FRND_REQUEST_ACCEPTED");		
		eventEmitter.emit('FRND_REQUEST_ACCEPTED', results);

		return res.status(201).json(results);
	});

};

// for socket-online
exports.findConfirm = function(id,callback){
	findAll({
		id : id,
		status : 'confirm'
	},callback);			
};

exports.getConfirm = function(req, res){
	findAll({
		id : req.user._id,
		status : 'confirm',
		populate : true
	},function(result){
		return res.json(result);
	});		
};
exports.getRcved = function(req, res){
	findAll({
		id : req.user._id,
		status : 'rcved',
		populate : true
	},function(result){
		return res.json(result);
	});	
};
exports.getSent = function(req, res){
	findAll({
		id : req.user._id,
		status : 'sent',
		populate : true
	},function(result){
		return res.json(result);
	});	
};


function findAll(conditions ,callback){
	var id = conditions.id;
	var status = conditions.status;
	var wantPopulate = conditions.populate;

	User.aggregate([
			{$match: {'_id' :  mongoose.Types.ObjectId(id)}},
		    {$unwind: '$friends.data'},
		    {$match: {'friends.data.status': status }},
		    {$project: { 
                'friend' : '$friends.data'                
            }}
		]).exec(function (err,results) {
			if (err){ return res.json(err); }
						
			var friends = [];
			results.forEach(function(user){
				friends.push(user.friend.who.toString());			
			});

			if(!wantPopulate){
				return callback(friends);		
			}

			pupulateAll(friends,function(friends){
				return callback(friends);
			});
			
		});
};

function pupulateAll(ids, callback){

	var functions = [];

	for(var i=0; i < ids.length; i++){
		var id = ids[i];
		functions.push(function(cb){			
	        User.findById(id).select("-hashedPassword -salt").populate("friends.data.who").exec(cb);
	    });	
	}

	async.parallel(functions,function(err, results){
		callback(results);
	});
};


