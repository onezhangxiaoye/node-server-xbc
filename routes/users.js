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

function responseSend(code, message, res, data) {
    res.send({
        code,
        message,
        data,
    });
    res.end();
}

router.post('/register',function (req, res, next) {
    let {userName, password} = req.body;
    if(userName === undefined){
        responseSend(1, '未接收到用户名参数', res);
        return;
    }
    if(password === undefined){
        responseSend(1, '未接收到密码参数', res);
        return;
    }

    if (userName.length < 3 || userName.length > 12) {
        let message = userName.length === 0 ? '用户名不能为空！' : (userName.length > 12 ? '用户名长度不能大于12位！' : '用户名必须大于3位！');
        responseSend(1, message, res);
        return;
    }
    if (password.length < 6 || password.length > 18) {
        let message = password.length === 0 ? '密码不能为空！' : (userName.length > 18 ? '密码长度不能大于18位！' : '密码长度必须大于6位！');
        responseSend(2, message, res);
        return;
    }
    let user = userList.find(v => v.userName === userName);
    if (user) {
        responseSend(3, '用户名已存在', res);
        return;
    }
    userList.push({userName, password});

    responseSend(0, 'success', res);

});


/**
 * 用户登录
 */
router.post('/', function (req, res, next) {
    let {userName, password} = req.body;

    if(userName === undefined){
        responseSend(1, '未接收到用户名参数', res);
        return;
    }
    if(password === undefined){
        responseSend(1, '未接收到密码参数', res);
        return;
    }

    if (userName.length < 3 || userName.length > 12) {
        let message = userName.length === 0 ? '用户名不能为空！' : (userName.length > 12 ? '用户名长度不能大于12位！' : '用户名必须大于3位！');
        responseSend(1, message, res);
        return;
    }
    if (password.length < 6 || password.length > 18) {
        let message = password.length === 0 ? '密码不能为空！' : (userName.length > 18 ? '密码长度不能大于18位！' : '密码长度必须大于6位！');
        responseSend(2, message, res);
        return;
    }

    let user = userList.find(v => v.userName === userName);
    if (!user) {
        responseSend(3, '用户名不存在', res);
        return;
    }
    if (user.password !== password) {
        responseSend(4, '密码错误', res);
        return;
    }

    console.log(userName, password);
    res.cookie('userName', userName, {httpOnly: true});
    res.cookie('password', password, {httpOnly: true});
    res.cookie('money', 0, {httpOnly: true});

    responseSend(0, 'success', res, {userName, password});
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
    let {userName, password, money} = req.cookies;
    if (!userName || !password) {
        responseSend(0, '未登录！', res);
    } else {
        responseSend(0, 'success', res, {
            userName,
            password,
            money,
        });
    }
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
        if(req.body.money === undefined){
            responseSend(1, '未接收到金额参数', res);
            return;
        }
        if (!(/^\d+$/.test(req.body.money))) {
            responseSend(1, '金额只能输入数字', res);
            return;
        }
        money = (+(money || 0)) + (+(req.body.money) || 0);
        res.cookie('money', money, {httpOnly: true});

        responseSend(0, 'success', res, {
            userName,
            password,
            money
        });
    }
});

module.exports = router;
