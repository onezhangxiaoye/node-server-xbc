const mysql = require('mysql');
//数据库连接配置
module.exports = ()=>{
    //数据库配置
    let mydb = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'1234',
        port:'3306',
        database:'xbc'
    });

    //连接数据库w
    mydb.connect((err)=>{
        if (err) {
            console.log(err)
        }
    });

    //防止乱码
    mydb.query('SET NAMES UTF8');

    return mydb;
}
