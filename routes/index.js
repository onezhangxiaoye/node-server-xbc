var express = require('express');
var router = express.Router();
let getIPAddress = require('../utils/utils').getIPAddress;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' ,ipAddress: getIPAddress()});
});

module.exports = router;
