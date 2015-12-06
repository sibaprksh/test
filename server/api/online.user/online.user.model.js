
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require("../user/user.model");

var Schema = new Schema({
  user : { type: mongoose.Schema.Types.ObjectId, ref : "User"},
  name: String, 
  avatar: {
    type: String,
    default: 'avatar.png'
  },
  when : {
  	type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OnlineUser', Schema);

