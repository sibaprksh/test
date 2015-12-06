
var User = require("../user/user.model");
var OnlineLine = require('./online.user.model');

exports.findByIds = function (ids, user, cb) {
	var condition = { "user" : { "$in" : ids } };
	OnlineLine.find(condition).lean().exec(cb);
};

exports.destroy = function(user, cb){
	var condition = { "user" : user._id };
	OnlineLine.remove( condition , function(err){
		if(err)
			cb(err);

		User.update({ _id : user._id.toString() }, { "logout" : Date.now() } , function(err){
			if(!err)
				console.log("logout time updated");
		});		
		cb(true);
	}); 
};

exports.creteOrUpdate = function(self, cb){
	OnlineLine.update({ 'user' : self.id }, self, { 'upsert' : true}, cb);
};