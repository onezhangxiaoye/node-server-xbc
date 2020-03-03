var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
//数据库配置
const mysql = require('../utils/mysql/mysql.js')();

function responseSend(code, message, res, data) {
    res.send({
        code,
        message,
        data,
    });
    res.end();
}

router.get('/', function (req, res, next) {
    // console.log(req.body);
    // res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });
    res.render('index', {title: 'Express'});
});

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
    //检查用户名是否存在
    let sql = "SELECT id FROM `users` WHERE user_name=?";
    mysql.query(sql, [userName], (err, data) => {
        console.log('检查用户名是否存在--',err, data);
        if (Array.isArray(data) && data.length > 0){
            responseSend(3, '用户名已存在', res);
        }else{
            //存如当前用户数据
            sql = "INSERT INTO `users` (`user_name`,`password`) VALUES (?,?)";
            mysql.query(sql, [userName, password], (err, data) => {
                console.log('用户注册--',err, data);
                if (data.affectedRows === 1){
                    responseSend(0, 'success', res);
                }else{
                    responseSend(1, '异常', res, {err, data});
                }
            })
        }
    });
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

    //检查用户名是否存在
    let sql = "SELECT id, user_name, password, money FROM `users` WHERE user_name=?";
    mysql.query(sql, [userName], (err, data) => {
        console.log('检查用户名是否存在--',err, data);
        if (!Array.isArray(data) || data.length === 0){
            responseSend(3, '用户名不存在', res);
        }else if(data[0].password !== password){
            responseSend(4, '密码错误', res);
        }else{
            res.cookie('userName', userName, {httpOnly: true});
            res.cookie('id', data[0].id, {httpOnly: true});
            responseSend(0, 'success', res, {userName, password});
        }
    });
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

/**
 * 充值
 */
router.post('/topUp', function (req, res, next) {
    console.log('req.cookies---', req.cookies);
    console.log('req.content-type---', req.headers['content-type']);
    let {userName, id} = req.cookies;
    if (!userName || !id) {
        responseSend(1, '未登录！', res);
    } else {
        if(req.body.money === undefined){
            responseSend(1, '未接收到金额参数', res);
            return;
        }
        if (!(/^\d+$/.test(req.body.money))) {
            responseSend(1, '金额只能输入数字', res);
            return;
        }

        money = +(req.body.money) || 0;

        //更新金额
        let sql = "UPDATE `users` SET money=money+? WHERE id=?";
        mysql.query(sql, [money, id], (err, data) => {
            console.log('更新金额--',err, data);
            if (data.affectedRows === 1){
                responseSend(0, 'success', res);
            }else{
                responseSend(1, '异常', res, {err, data});
            }
        });
    }
});

/**
 * 购买支付
 */
router.post('/buy', async function (req, res, next) {
    let {userName, id} = req.cookies;
    if(!userName || !id){
        responseSend(1, '未登录！', res);
        return;
    }
    let {goodsList} = req.body;
    if(!Array.isArray(goodsList) || goodsList.length === 0){
        responseSend(1, '购买商品不能为空！', res);
        return;
    }
    console.log(goodsList);
    let count = 0;
    goodsList.forEach(v => {
        if(!(Object.prototype.toString.call(v) !== '[Object object]') || !v.goodsId || !v.goodsNum) count++;
    });
    if(count !== 0){
        responseSend(1, '传入得商品参数异常！', res);
        return;
    }

    let userMoney = await getUserMoneyById(id);
    if(userMoney === 0){
        responseSend(1, '余额不足！', res);
        return;
    }
    
    //检查商品的库存和余额是否可以完成支付
    let countMoney = 0;
    for (let item of goodsList){
        let goods = await getGoodsById(item.goodsId);
        if(!goods){
           responseSend(1, `商品不存在！`, res);
           return
        }
        countMoney += item.goodsNum * goods.price;
        if(countMoney > userMoney){
            responseSend(1, `您的余额不足了！`, res);
            return;
        }
        if(item.goodsNum > goods.num){
            responseSend(1, `商品-${goods.name}-的库存不足了！`, res);
            return;
        }
    }
    /**
     * 开启事务
     */
    mysql.beginTransaction(async function (err){

        for (let item of goodsList){
            let error = await createOrder(id, item.goodsId, item.goodsNum);
            if(error !== true){
                responseSend(1, `下单失败！`, res);
                return mysql.rollback(function() {
                    throw error;
                });
            }
            error = await updateGoodsNum(item.goodsId, item.goodsNum);
            if(error !== true){
                responseSend(1, `下单失败！`, res);
                return mysql.rollback(function() {
                    throw error;
                });
            }
        }
        let error = await updateUserMoney(id, countMoney);
        if(error !== true){
            responseSend(1, `下单失败！`, res);
            return mysql.rollback(function() {
                throw error;
            });
        }
        mysql.commit(function(err) {
            if (err) {
                return mysql.rollback(function() {
                    throw err;
                });
            }
            responseSend(0, `success`, res);
        });
    });
});

async function updateUserMoney(id, money){
    const sql = "UPDATE `users` SET money=money-? WHERE id=?;";
    return new Promise(((resolve, reject) => {
        mysql.query(sql, [money, id], (err, data) => {
            console.log('更新用户余额--', data);
            if(err){
                resolve(err);
            }else if (data.affectedRows === 1){
                resolve(true);
            }else{
                resolve(new Error('未知异常！'));
            }
        });
    }))
}

async function updateGoodsNum(goods_id, goods_num){
    const sql = "UPDATE `goods` SET num=num-? WHERE id=?;";
    return new Promise(((resolve, reject) => {
        mysql.query(sql, [goods_num, goods_id], (err, data) => {
            console.log('更新订单--', data);
            if(err){
                resolve(err);
            }else if (data.affectedRows === 1){
                resolve(true);
            }else{
                resolve(new Error('未知异常！'));
            }
        });
    }))
}

async function createOrder(user_id, goods_id, goods_num){
    const sql = "INSERT INTO `order` (user_id, goods_id, goods_num, create_time) VALUE (?, ?, ?, (SELECT CURRENT_TIMESTAMP()));";
    return new Promise(((resolve, reject) => {
        mysql.query(sql, [user_id, goods_id, goods_num], (err, data) => {
            console.log('生成订单--', data);
            if(err){
                resolve(err);
            }else if (data.affectedRows === 1){
                resolve(true);
            }else{
                resolve(new Error('未知异常！'));
            }
        });
    }))
}

/**
 *
 * @param id
 * @returns {Promise<unknown>}
 */
async function getGoodsById(id){
    const sql = "SELECT * FROM `goods` WHERE id=?";
    return new Promise(((resolve, reject) => {
        mysql.query(sql, [id], (err, data) => {
            console.log('通过id查询商品--', err, data);
            if (Array.isArray(data) && data.length > 0){
                resolve(data[0])
            }else{
                resolve(false);
            }
        });
    }))
}

async function getUserMoneyById(id){
    const sql = "SELECT money FROM `users` WHERE id=?";
    return new Promise(((resolve, reject) => {
        mysql.query(sql, [id], (err, data) => {
            console.log('getUserMoneyById', data);
            if (Array.isArray(data) && data.length > 0){
                resolve(data[0].money);
            }else{
                resolve(false);
            }
        });
    }))
}



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

module.exports = router;
