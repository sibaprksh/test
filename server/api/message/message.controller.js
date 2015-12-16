'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Message = require('./message.model');

// Get list of messages to me
exports.index = function(req, res) {
  var myId = req.user._id;
  var conditions = {
    $or: [ { 
      to: myId
    }, { 
      from: myId
    } ] 
  };
  Message.find(conditions,function (err, messages) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(messages);
  });
};

// Get list of messages between me & :id
exports.show = function(req, res) {
  var myId = req.user._id;
  var otherId = req.params.fId;

  var conditions = {
    $or: [ { 
      to: myId,
      from: otherId
    }, { 
      to: otherId,
      from: myId
    } ]
  };

  Message.find(conditions, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    return res.json(message);
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {  
  var data = {
    from    : req.user._id,
    to      : req.body.to,
    content : req.body.content 
  };
  Message.create(data, function(err, message) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(message);
  });
};

exports.update = function(req, res) {
	var status = (req.body.status || "").toUpperCase().charAt(0);	
	var whose = req.body.whose;
	var who = req.user._id;

	switch(status){
		case "D" :
			deliver(who, whose, function(err, numAffected){
				if(err) return handleError(res, err);
    			return res.status(200).json(numAffected);
			});
			break;
		case "S" :
			seen(who, whose, function(err, numAffected){
				if(err) return handleError(res, err);
    			return res.status(200).json(numAffected);
			});
			break;
				
		default :
			return res.status(500).send("Not Acceptable Status");
	}
};

// Update delivery
function deliver(who, whose, cb) {
  
  var conditions = { from : whose, to : who , status : 'C' }
    , update = { 
        $currentDate: { deliver: true },
        $set: {
          status: "D"      
        }
      }
    , options = { multi: true };

  Message.update(conditions, update, options, cb);  
};
// Update seen
function seen(who, whose, cb){
   
  var conditions = { from : whose, to : who , $or : [ {status : 'D'}, {status : 'C'}] }
    , update = { 
        $currentDate: { seen: true },
        $set: {
          status: "S"      
        }
      }
    , options = { multi: true };

  Message.update(conditions, update, options, cb); 
};

// // Deletes a message from the DB.
// exports.destroy = function(req, res) {
//   Message.findById(req.params.id, function (err, message) {
//     if(err) { return handleError(res, err); }
//     if(!message) { return res.status(404).send('Not Found'); }
//     message.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.status(204).send('No Content');
//     });
//   });
// };

function handleError(res, err) {
  return res.status(500).send(err);
}
