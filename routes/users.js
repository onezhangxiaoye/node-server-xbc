var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');


/**
 * 用户登录
 */
router.post('/', function (req, res, next) {
    let {userName, password} = req.body;
    console.log(userName, password);
    res.cookie('userName', userName, {httpOnly: true});
    res.cookie('password', password, {httpOnly: true});
    res.cookie('money', 0, {httpOnly: true});

    res.send({userName, password});
    res.end();
});
router.get('/', function (req, res, next) {
    // console.log(req.body);
    // res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });
    res.render('index', {title: 'Express'});
});

/**
 * 查询用户信息
 */
router.post('/userInfo', function (req, res, next) {
    console.log(req.cookies);

    let {userName, password, money} = req.cookies;
    if (!userName || !password) {
        res.send({
            message: '未登录！'
        });
    } else {
        console.log(userName, password,);
        res.send({
            userName,
            password,
            money,
        });
    }
    res.end();
});

router.post('/formData', function (req, res, next) {
    // parse a file upload
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        console.log(fields);
        res.send({
            userName: '123',
            password: '234',
            sex: '男'
        });
        res.end();
    });

});

router.post('/pay', function (req, res, next) {

  let {userName, password, money} = req.cookies;
  money = (+money)+(+req.body.money);
  res.cookie('money', money, {httpOnly: true});
  if (!userName || !password) {
    res.send({
      message: '未登录！'
    });
  } else {
    res.send({
      userName,
      password,
      money
    });
  }
  res.end();
});

module.exports = router;
