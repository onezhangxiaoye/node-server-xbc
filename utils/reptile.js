const https = require('https');
const stringUtil = require('../utils/stringUtil');

let cookies = '_jc_save_fromStation=%u5357%u5145%2CNCW; _jc_save_toStation=%u6210%u90FD%2CCDW; _jc_save_fromDate=2020-02-08;';
cookies = cookies.split(';').map(v => v.trim());

let options = {
    method: 'GET',
    headers:{
        'Content-Type': 'application/json;charset=UTF-8'
    }
};

function cr(cQ, cS) {
    var cP = [];
    for (var cO = 0; cO < cQ.length; cO++) {
        var cT = {};
        var cN = cQ[cO].split("|");
        cT.secretStr = cN[0];
        cT.buttonTextInfo = cN[1];
        var cR = {};


        cR.secretStr = cN[0];
        cR.buttonTextInfo = cN[1];
        cR.train_no = cN[2];
        cR.station_train_code = cN[3];
        cR.start_station_telecode = cN[4];
        cR.end_station_telecode = cN[5];
        cR.from_station_telecode = cN[6];
        cR.to_station_telecode = cN[7];
        cR.start_time = cN[8];
        cR.arrive_time = cN[9];
        cR.lishi = cN[10];
        cR.canWebBuy = cN[11];
        cR.yp_info = cN[12];
        cR.start_train_date = cN[13];
        cR.train_seat_feature = cN[14];
        cR.location_code = cN[15];
        cR.from_station_no = cN[16];
        cR.to_station_no = cN[17];
        cR.is_support_card = cN[18];
        cR.controlled_train_flag = cN[19];
        cR.gg_num = cN[20] ? cN[20] : "--";
        cR.gr_num = cN[21] ? cN[21] : "--";
        cR.qt_num = cN[22] ? cN[22] : "--";
        cR.rw_num = cN[23] ? cN[23] : "--";
        cR.rz_num = cN[24] ? cN[24] : "--";
        cR.tz_num = cN[25] ? cN[25] : "--";
        cR.wz_num = cN[26] ? cN[26] : "--";
        cR.yb_num = cN[27] ? cN[27] : "--";
        cR.yw_num = cN[28] ? cN[28] : "--";
        cR.yz_num = cN[29] ? cN[29] : "--";
        cR.ze_num = cN[30] ? cN[30] : "--";
        cR.zy_num = cN[31] ? cN[31] : "--";
        cR.swz_num = cN[32] ? cN[32] : "--";
        cR.srrb_num = cN[33] ? cN[33] : "--";
        cR.yp_ex = cN[34];
        cR.seat_types = cN[35];
        cR.exchange_train_flag = cN[36];
        cR.houbu_train_flag = cN[37];
        cR.houbu_seat_limit = cN[38];
        if (cN.length > 46) {
            cR.dw_flag = cN[46]
        }
        cR.from_station_name = cS[cN[6]];
        cR.to_station_name = cS[cN[7]];
        cT.queryLeftNewDTO = cR;
        cP.push(cR)
    }
    return cP
}

function getUrl(from_station, to_station, train_date) {
    return `https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=${train_date}&leftTicketDTO.from_station=${from_station}&leftTicketDTO.to_station=${to_station}&purpose_codes=ADULT`;
}

function getCookies(from_station, to_station, train_date){
    let cookies = `_jc_save_fromStation=${stringUtil.stringEncodeUnicode(from_station.cityName) + from_station.capitalShorthand}; _jc_save_toStation=${stringUtil.stringEncodeUnicode(to_station.cityName) + to_station.capitalShorthand}; _jc_save_fromDate=${train_date}`;
    return cookies.split(';').map(v => v.trim());
}


module.exports = {
    getTickets: function (from_station, to_station, train_date) {
        let url = getUrl(from_station.capitalShorthand, to_station.capitalShorthand, train_date),
            cookies = getCookies(from_station, to_station, train_date);
        console.log(url);
        console.log(cookies);
        return new Promise(((resolve, reject) => {
            let req = https.request(url, options, function (res) {
                let bodyData = [];
                res.on('data', function (chunk) {
                    bodyData.push(chunk);
                });
                res.on('end', function () {
                    if(res.statusCode !== 200){
                        reject({
                            statusCode: res.statusCode
                        });
                    }else{
                        bodyData = Buffer.concat(bodyData).toString();
                        let cR = JSON.parse(bodyData);
                        if (cR.data.flag == 1) {
                            cR.data = cr(cR.data.result, cR.data.map);
                            let params = {
                                statusCode: res.statusCode,
                                data: cR.data
                            };
                            resolve(params);
                        }
                    }
                })
            });
            req.setHeader('Cookie',cookies);
            req.end();
        }))
    }
};

