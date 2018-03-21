/**
 * 给存储在富文本编辑框里的内容加上html的头和样式，让显示更美观
 * @param content
 * @returns {String}
 */


function editHTML(content){
    var HTML_HEAD = ""
        + "<head><meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'/>"
        + "<style type=\"text/css\">\n" +
        "\tbody{padding:0;margin:0}" +
        "\timg{width:100%}" +
        "\t.detail_intro{\n" +
        "\t\tfont-size: 12px;\n" +
        "\t    color: #5A5A5A;\n" +
        "\t    width: 100%;\n" +
        "\t    overflow-x: hidden;\n" +
        "\t    font-family: 'microsoft yahei', Verdana, Arial, Helvetica, sans-serif;\n" +
        "\t}\n" +
        "\t.detail_intro p{\n" +
        "\t\t margin: -.2rem 0 0 !important;\n" +
        "\t}\n" +
        "\t.detail_intro table{\n" +
        "\t\tborder-spacing: 0px;\n" +
        "\t    border-collapse: collapse;\n" +
        "\t    font-size:16px;color:#5A5A5A;font-family:'microsoft yahei', Verdana, Arial, Helvetica, sans-serif;\n" +
        "\t    margin:0px;padding:0px;\n" +
        "\t    width: 100%!important;\n" +
        "\t    background:#fff!important\n" +
        "\n" +
        "\t}\n" +
        "\n" +
        "\t.detail_intro td {\n" +
        "\t    height: 10px;\n" +
        "\t    padding: 0 5px;\n" +
        "\t    line-height: 20px;\n" +
        "\t    font-size: 12px;\n" +
        "\t    color: #333;\n" +
        "\t    word-break: break-all;\n" +
        "\t    border:1px solid #000!important;\n" +
        "\t    background: #fff!important;\n" +
        "\t}\n" +
        "\t.detail_intro tr td:first-child{\n" +
        "\t\ttext-align: center;\n" +
        "\t    width: 130px;\n" +
        "\t}\n" +
        "</style></head><body><div class=\"detail_intro\">";
    var HTML_END = "</div>";
    var html = HTML_HEAD+content+HTML_END;
    return html;
}

/**
 * 获取url参数里某个健对应的值
 * E.g.: www.tianzhidao.com?login=greentang,键名是login，它对应的值为greentang
 * @param name 键名
 * @returns
 */
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

/**
 * 获取购物车本地缓存的信息
 * @param object
 * @returns {___anonymous1989_2230}
 */
function getBuyJSON(object)
{
	if (object != null && parseInt(object.onlineId) != 0){
		var json = {
			"showName":object.showName,
			"mailMoney": object.mailMoney,
			"salePrice": object.salePrice,
			"onlineId": object.onlineId,
			"bigPic": object.bigPic,
			"goodId": object.skuId,
			"purchasePrice": object.purchasePrice,
			"num": 0};
	}
	return json;
}