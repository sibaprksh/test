

var express = require('express');
var controller = require('./friend.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');


var router = express.Router();

// send
router.get('/request/send/:id', auth.isAuthenticated(), controller.send);

// accept
router.get('/request/accept/:id', auth.isAuthenticated(), controller.accept);


router.get('/confirm', auth.isAuthenticated(), controller.getConfirm);
router.get('/rcved', auth.isAuthenticated(), controller.getRcved);
router.get('/sent', auth.isAuthenticated(), controller.getSent);

module.exports = router;