let stringUtil = {};

stringUtil.encodeUnicode = function(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
    }
    return "%u" + res.join("\\u");
};

stringUtil.stringEncodeUnicode = function(str){
    return str.split('').map(stringUtil.encodeUnicode).join('') + '%2C';
};

module.exports = stringUtil;