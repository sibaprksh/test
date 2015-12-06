/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
// var Friend = require('../api/friend/friend.model');
// var Message = require('../api/message/message.model');
var User = require('../api/user/user.model');

// Insert seed data below
// var friendSeed = require('../api/friend/friend.seed.json');
// var messageSeed = require('../api/message/message.seed.json');
var userSeed = require('../api/user/user.seed.json');

// Insert seed inserts below
// Friend.find({}).remove(function() {
// 	Friend.create(friendSeed);
// });

// Message.find({}).remove(function() {
// 	Message.create(messageSeed);
// });

// User.find({}).remove(function() {
//   User.create(userSeed);
// });


require('../api/online.user/online.user.model')
	.remove({}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log('Removed all online users');
            }
        }
    );