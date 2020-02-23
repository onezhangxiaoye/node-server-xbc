var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');

const userList = [
    {
        userName: 'admin',
        password: '123123',
    },
    {
        userName: '12317xiang',
        password: '123456',
    },
    {
        userName: 'xiaobaicai',
        password: '666666',
    },
];

function errSend(code, message, res) {
    res.send({
        code,
        message,
    });
    res.end();
}

router.post('/register',function (req, res, next) {
    let {userName, password} = req.body;

    if (userName.length < 3 || userName.length > 12) {
        let message = userName.length === 0 ? '用户名不能为空！' : (userName.length > 12 ? '用户名长度不能大于12位！' : '用户名必须大于3位！');
        errSend(1, message, res);
        return;
    }
    if (password.length < 6 || password.length > 18) {
        let message = password.length === 0 ? '密码不能为空！' : (userName.length > 18 ? '密码长度不能大于18位！' : '密码长度必须大于6位！');
        errSend(2, message, res);
        return;
    }
    let user = userList.find(v => v.userName === userName);
    if (user) {
        errSend(3, '用户名已存在', res);
        return;
    }
    userList.push({userName, password});

    errSend(0, '注册成功', res);

});


/**
 * 用户登录
 */
router.post('/', function (req, res, next) {
    let {userName, password} = req.body;

    if (userName.length < 3 || userName.length > 12) {
        let message = userName.length === 0 ? '用户名不能为空！' : (userName.length > 12 ? '用户名长度不能大于12位！' : '用户名必须大于3位！');
        errSend(1, message, res);
        return;
    }
    if (password.length < 6 || password.length > 18) {
        let message = password.length === 0 ? '密码不能为空！' : (userName.length > 18 ? '密码长度不能大于18位！' : '密码长度必须大于6位！');
        errSend(2, message, res);
        return;
    }

    let user = userList.find(v => v.userName === userName);
    if (!user) {
        errSend(3, '用户名不存在', res);
        return;
    }
    if (user.password !== password) {
        errSend(4, '密码错误', res);
        return;
    }


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
    console.log('req.cookies---', req.cookies);
    console.log('req.content-type---', req.headers['content-type']);
    let {userName, password, money} = req.cookies;
    if (!userName || !password) {
        res.send({
            message: '未登录！'
        });
    } else {
        console.log(/^\d+$/.test(req.body.money));
        if (!(/^\d+$/.test(req.body.money))) {
            errSend(1, '金额只能输入数字', res);
            return;
        }
        money = (+(money || 0)) + (+(req.body.money) || 0);
        res.cookie('money', money, {httpOnly: true});
        res.send({
            userName,
            password,
            money
        });
    }
    res.end();
});

module.exports = router;
