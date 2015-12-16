'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var captainHook  = require('captain-hook');

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  avatar: {
    type: String,
    default: 'avatar.png'
  },
  role: {
    type: String,
    default: 'user'
  },

  logout : Date,

  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},

  // friends : {
  //   confirm : {
  //     data : [{       
  //       'who' : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //       //'when' : { type: Date, default: new Date() }       
  //     }]  // confirmed friend
  //   }, 
  //   rcved : {
  //     data : [{       
  //       'who' : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //       //'when' : { type: Date, default: new Date() }       
  //     }]    // request pending
  //   },
  //   sent : {
  //     data : [{       
  //       'who' : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //       //'when' : { type: Date, default: new Date() }       
  //     }]    // request sent
  //   }
  // }

  friends : {
    rcved   : { type : Number, default : 0 },
    sent    : { type : Number, default : 0 },
    confirm : { type : Number, default : 0 },
    data : [{
        who     : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        status  : String,
        sent    : Date,
        confirm : Date,
        rcved   : Date
    }]
  }

});

//UserSchema.plugin(captainHook);
UserSchema.plugin(require('mongoose-eventify'));

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('public')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
// UserSchema
//   .virtual('token')
//   .get(function() {
//     return {
//       '_id': this._id,
//       'role': this.role
//     };
//   });

// return info used for chat
UserSchema
  .virtual('chatInfo')
  .get(function() {
    return {      
      '_id' : this._id,
      'name' : this.name,
      'avatar' : this.avatar
    };
  });



/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
