var express = require('express');
var router = express.Router();


var reptile = require('../utils/reptile');

/* GET users listing. */
router.post('/', function(req, res, next) {
    let {fromStation, toStation, trainDate, fromCityName, toCityName} = req.body;

    reptile.getTickets(fromStation, toStation, trainDate, fromCityName, toCityName).then(result => {
        // console.log(res)
        res.send(result);
        res.end();
    }).catch(e => {
        res.send(e);
        res.end();
    })

});

router.post('/getCode', function(req, res, next) {

})


module.exports = router;