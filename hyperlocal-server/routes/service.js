'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('hyperlocal', { title: 'Hyperlocal: Service Discovered' });
});

module.exports = function(app, config){
    app.use('/service', router);
};
