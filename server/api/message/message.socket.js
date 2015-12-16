/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var eventEmitter = require('../../components/EventEmitter');

var config = require('../../config/environment');
var userRoom_prefix = config.socket.room_prefix;

exports.register = function(socket){

}


exports.registerIO = function(socketio) {
	eventEmitter.on('NEW_PRIVATE_MSG', function(result){
		onSave(socketio, result);
	});

	eventEmitter.on('MSG_DELIVERED', function(result){
		onDeliver(socketio, result);		
	});

	eventEmitter.on('MSG_SEEN', function(result){
		onSeen(socketio, result);		
	});
};

function onSave(socketio, result){
	console.log("NEW_PRIVATE_MSG");		
	socketio.to(userRoom_prefix + result.to._id).emit('NEW_PRIVATE_MSG', result);
	socketio.to(userRoom_prefix + result.from._id).emit('NEW_PRIVATE_MSG', result);
};

function onDeliver(socketio, result){
	console.log("MSG_DELIVERED");	
	socketio.to(userRoom_prefix + result.whose._id).emit('MSG_DELIVERED', result);
	socketio.to(userRoom_prefix + result.whome._id).emit('MSG_DELIVERED', result);	
};

function onSeen(socketio, result){
	console.log("MSG_SEEN");	
	socketio.to(userRoom_prefix + result.whose._id).emit('MSG_SEEN', result);
	socketio.to(userRoom_prefix + result.who._id).emit('MSG_SEEN', result);	
};

