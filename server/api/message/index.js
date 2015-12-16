'use strict';

var express = require('express');
var controller = require('./message.controller');

var auth = require('../../auth/auth.service');

var router = express.Router();

router.use(auth.isAuthenticated());

router.get('/', controller.index); // get msgs related to me
router.get('/:fId', controller.show); // get msgs between me & friend (fId)

router.post('/', controller.create);

// router.delete('/:id', controller.destroy);

// { "status" : "Seen/Delivered" , "whose" : "566860b4656285300ef35e55" }
router.put('/', controller.update);


module.exports = router;
