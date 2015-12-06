/**
 * Socket.io configuration
 */

'use strict';

var Q = require('q');

var config = require('./environment');

var OnlineLineCtrl = require('../api/online.user/online.user.controller');
var FrndCtrl = require('../api/friend/friend.controller');

var userRoom_prefix = config.socket.room_prefix;

//var OnlineLine = require('../api/online.user/online.user.model');
//var User = require('../api/user/user.model');


function onlineUserFilter ( ids , self ){
  var deferred = Q.defer();

  OnlineLineCtrl.findByIds(ids, self, function(err,docs){
      if(err)
        deferred.reject(err);
      else
        deferred.resolve(docs);
  });

	return deferred.promise;
};

// When the user disconnects.. perform this
function onDisconnect(socket,io) {

  console.log("After disconnect");

  var userId = socket.decoded_token._id;  // get user._id from token
 
  var isLogout;

  if(!io.sockets.adapter.rooms[userRoom_prefix + userId])
  	isLogout = true;

  console.log("isLogout : "+ isLogout);

  if( isLogout ){

    FrndCtrl.find.confirm(userId, function(frndIds, self){

        if(frndIds && frndIds.length > 0){

            // collect user who is online
            var promis = onlineUserFilter( frndIds );
            promis.then(function(online){
                // ittirate over online user to emit about new-user-login
                online.forEach(function(frnd){
                  var fId = frnd.user.toString() ;
                  io.to(userRoom_prefix+fId).emit('OFFLINE_FRND', self);
                });                               
            });            
        }
       
        OnlineLineCtrl.destroy(self,function(status){
          if(status == true)
            console.log("removed logout user from db");
        });
    });

  };

};

function handleOnline(socket,io){

  debugger;

  var userId = socket.decoded_token._id;  // get user._id from token
  var isNewLogin;                         // will give user is logged in before (or) not
  
  if(! io.sockets.adapter.rooms[userRoom_prefix + userId] ){
    isNewLogin = true;    
  }

  //socket.userId = userId;                     //* add _id
  socket.join(userRoom_prefix + userId);      //* join to room


    FrndCtrl.find.confirm(userId, function(frndIds, self){

        if(frndIds && frndIds.length > 0){            
            var promis = onlineUserFilter( frndIds , self );  // collect user who is online
            promis.then(function(online){                
                if( isNewLogin ){
                  online.forEach(function(frnd){ // ittirate over online user to emit about new-user-login
                    var fId = frnd.user.toString() ;
                    io.to(userRoom_prefix+fId).emit('ONLINE_FRND', self);
                  });              
                }
                socket.emit('ONLINE_FRNDS',online);
            });            
        }else{
          socket.emit('ONLINE_FRNDS',[]);
        }

        if( isNewLogin ){
          self.id = self._id;
          delete self._id;
          self.when = Date.now();
                    
          OnlineLineCtrl.creteOrUpdate(self,function(err){
              if(err)
                console.log(err);
              else
                console.log("successfully save to online");
          });

        };



    });


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
      console.info('[%s] DISCONNECTED', socket.address);
      onDisconnect(socket, socketio);      
    });    
    
    console.info('[%s] CONNECTED', socket.address);
  });

};