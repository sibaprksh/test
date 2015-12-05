/**
 * Main application routes
 */

'use strict';

var path = require('path');

module.exports = function(app) {

  // Insert routes below 
  //app.use('/api/friends', require('./api/friend'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));
  

};
