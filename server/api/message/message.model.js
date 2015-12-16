'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require("../user/user.model");

var Schema = new Schema({
  from 		 : { type: mongoose.Schema.Types.ObjectId, ref : "User"},
  to 		    : { type: mongoose.Schema.Types.ObjectId, ref : "User"},
  content   : String,
  deliver : Date,
  seen : Date,
  status : { type : String, default : 'C' } // C-Created, D-Delivered, S-Seen
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

Schema.virtual('when').get( function () { 
  return this["when"] = this._id.getTimestamp();
});

// Schema.virtual('deliver_v').get( function () {
//   if (this["deliver_v"]) return this["deliver_v"];
//   return this["deliver_v"] = this["seen"];
// });


module.exports = mongoose.model('Message', Schema);