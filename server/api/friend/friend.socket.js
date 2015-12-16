/**
 * Broadcast updates to client when the model changes
 */

'use strict';

//var User = require('../user/user.model').schema;

// exports.register = function(socket) {  
//   User.schema.post('remove', function (doc) {
//     //onRemove(socket, doc);
//   });
//   User.schema.post('save', function (doc) {
//     console.log('post save');
//   });
//   User.schema.post('update', function (doc) {
//     console.log('post update');
//   });
// };

// function onSave(socket, doc, cb) {
//   socket.emit('friend:save', doc);
// }

// function onRemove(socket, doc, cb) {
//   socket.emit('friend:remove', doc);
// }

// User.pre('save', function(doc) {
// 	doc.action = {};
// });

// User.post('save', function(doc) {
// 	debugger;
// 	if(!doc.isNew){  	
//   		switch(doc.action.status){
//   			case "rcved" :
//   				friendReq.onReved(socket, doc, doc.action.target);
//   				break;
//   		}
// 	}
// });

// var friendReq = {
// 	onReved : function(socket, doc, target){

// 	};
// 	onConfirm : function(socket, doc, target){

// 	};
// };

var eventEmitter = require('../../components/EventEmitter');

var config = require('../../config/environment');
var userRoom_prefix = config.socket.room_prefix;

exports.registerIO = function(socketio) {
	eventEmitter.on('FRND_REQUEST_RCVED', function(result){

		console.log("FRND_REQUEST_RCVED");	

		var to = result.To;
		socketio.to(userRoom_prefix + to._id).emit('FRND_REQUEST_RCVED', result);

		var self = result.From;
		socketio.to(userRoom_prefix + self._id).emit('FRND_REQUEST_SENT', result);
	});
	eventEmitter.on('FRND_REQUEST_ACCEPTED', function(result){

		console.log("FRND_REQUEST_ACCEPTED");	

		var who = result.who;
		socketio.to(userRoom_prefix + who._id).emit('FRND_REQUEST_ACCEPTED', result);

		var whose = result.whose;
		socketio.to(userRoom_prefix + whose._id).emit('FRND_REQUEST_ACCEPTED', result);
	});
};

