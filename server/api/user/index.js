'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/search/:query', auth.isAuthenticated(), controller.search);
router.get('/check-email', controller.exist);


router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);



var frndController = require('../friend/friend.controller');

// send
router.get('/friendrequest/send/:id', auth.isAuthenticated(), frndController.send);

// accept



module.exports = router;
