/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');

var FrndCtrl = require('../api/friend/friend.controller');
var OnlineLine = require('../api/online.user/online.user.model');

var userRoom_prefix = config.socket.room_prefix;

var onlineUsers = {};

var onlineUserFilter = function(onlineUsers , ids){
	var onFrnds = [];
	ids.forEach(function(id){
		var user;
		if( user = onlineUsers[id] ){
			onFrnds.push(user);
		}
	});
	return onFrnds;
};

// When the user disconnects.. perform this
function onDisconnect(socket,io) {
  var id = socket.userId;
  var user = onlineUsers[id];

  console.log( "onDisconnect : Room :" + userRoom_prefix + id );
  
  if(io.sockets.adapter.rooms[userRoom_prefix + id])
  	console.log(Object.keys(io.sockets.adapter.rooms[userRoom_prefix + id]).length);
  else
  	console.log("Undefine room");


  delete onlineUsers[id];

  FrndCtrl.find.confirm(id, function(friends){
      if(friends && friends.length > 0){
          // collect user who is online
          var online = onlineUserFilter( onlineUsers, friends );

          // ittirate over online user to emit about new-user-login
          online.forEach(function(frnd){
            var fId = frnd._id ;
            io.to(userRoom_prefix+fId).emit('OFFLINE_FRND', user);
          });
         
         
      }
  });

};

function handleOnline(socket,io){
  //var userId = socket.handshake.query.userId;
  var userId = socket.decoded_token._id;

  console.log("I am inside onConnect");
  console.log("user Id : "+ userId);

  debugger;

  console.log( "Before join the Room :" + userRoom_prefix + userId );
  if(io.sockets.adapter.rooms[userRoom_prefix + userId])
  	console.log(Object.keys(io.sockets.adapter.rooms[userRoom_prefix + userId]).length);
  else
  	console.log("Undefine room");

  socket.userId = userId;                     //* add _id
  socket.join(userRoom_prefix + userId);      //* add to room

  console.log( "After join the Room :" + userRoom_prefix + userId );
  console.log(Object.keys(io.sockets.adapter.rooms[userRoom_prefix + userId]).length);

  if(! onlineUsers[userId] ){

    var key = userId;
    //onlineUsers[key] = { _id : userId, name : "", pic : "" };

    FrndCtrl.find.confirm(key, function(friends, self){
        
        onlineUsers[key] = self; // set user

        if(friends && friends.length > 0){
            // collect user who is online
            var online = onlineUserFilter( onlineUsers, friends );

            // ittirate over online user to emit about new-user-login
            online.forEach(function(frnd){
              var fId = frnd._id ;
              io.to(userRoom_prefix+fId).emit('ONLINE_FRND', self);
            });
           
            socket.emit('ONLINE_FRNDS',online);
        }
    });

  };
};

// When the user connects.. perform this
function handleConnect(socketio) {
  require('../api/friend/friend.socket').register(socketio);
  //require('../api/message/message.socket').register(socketio); 
};

module.exports = function (socketio) {
  /**
  *  client side code : (with token)
  *  var socket = io.connect('', {
  *      query: 'token=' + token + '&userId='+uId
  *  });
  **/
  socketio.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));


  // handle socketio
  handleConnect(socketio);  

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            //socket.handshake.address.address + ':' + socket.handshake.address.port :
            socket.request.connection.remoteAddress :
            process.env.DOMAIN;

    debugger;

    socket.connectedAt = new Date();

    // handle online user
    handleOnline(socket,socketio);

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket, socketio);
      console.info('[%s] DISCONNECTED', socket.address);
    });    
    
    console.info('[%s] CONNECTED', socket.address);
  });

};