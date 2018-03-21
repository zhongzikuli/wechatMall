var DEFAULT_HEADIMG="../img/default_headimg.png";
var DRAW_MIN_MONEY=10000;
//微信appid
var g_wxappid="wx6c900731ed087ec5";
var CUR_HTML_VERSION=2003;

//setLocalSession("custId",3);
//setLocalSession("openid",'oQj1ywA3WiUfIzmrkHs13WMiUchs');
//setLocalSession("nickName",'虚拟用户');
//setLocalSession("headimgUrl",'http://wx.qlogo.cn/mmopen/Q3auHgzwzM4dKd1bPdCoHh3447ruHqFQ7Q65giak1NLLDYoV2KAd1gONvVt3y3V1iaN2nKicmGTvfG3hwG1om15Pg/0');
//setLocalSession("sex",'男');
//setLocalSession("userType",2);
//setLocalSession("level",'系主任');
//setLocalSession("inviteCode",'123456');

/**
获取本地缓存信息:不用失效处理
*/
function getLocalSession(v_key) {
	if (window.localStorage) {
		if (localStorage[v_key] == undefined) {
			return null;
		} else {
			return localStorage[v_key];
		}
	} else {
		return null;
	}
}

/**
设置缓存信息
*/
function setLocalSession(v_key, v_value) {
	if (window.localStorage) {
		localStorage[v_key] = v_value;
	}
}

/**
缓存session
*/
function setSession(v_key, v_value) {
	if (window.sessionStorage) {
		sessionStorage[v_key] = v_value;
	}
}

/**
获取session
*/
function getSession(v_key) {
	if (window.sessionStorage) {
		if (sessionStorage[v_key] == undefined) {
			return null;
		} else {
			return sessionStorage[v_key];
		}
	} else {
		return null;
	}
}

(function ($) {
	var debug = false;
	
	/**
	 * 接口服务地址:本地页面全部调用开发服务器的ajax接口
	 */
	 var g_ajax_url = "http://qmjs.xiaohongquan.cn";
	 var g_domain_url="http://qmjs.xiaohongquan.cn";

	/**
	本地缓存参数
	*/
	var g_localParams = [];
	/**
	session缓存参数
	*/
	var g_sessionParams = [];
	/**
	session缓存参数
	*/
	var g_session = ['openid'];
	
	var _globalLoading;
	
	/**
	公共校验
	*/
	g_pubCheck = [
		'checkWX()',
		'initAnalyse()'
	];
	
	function errorPage() {
		window.location.href = g_ajax_url+"/dist/html/errorPage.html";
	}
	
	/**
	解析入参
	*/
	function initAnalyse() {
		search = window.location.search;
		var wxcode;
		if (search != null && search != undefined) {
			search = search.substr(1);
			kvs = search.split('&');
			for (i in kvs) {
				kv = kvs[i];
				value = kv.split('=');
				if (kv.indexOf('openid=') != -1) {
					setLocalSession('openid', value[1]);
				}if (kv.indexOf('code=') != -1) {
					wxcode= value[1];
				}
			}
		}

		if (getLocalSession('openid') == null || getLocalSession('openid') == undefined || getLocalSession('openid')=='') {
			if (wxcode == null || wxcode == undefined || wxcode == '') {
				var redirectUrl = encodeURI(window.location);
				window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+g_wxappid+"&redirect_uri="+redirectUrl+"&response_type=code&scope=snsapi_userinfo&state=1234#wechat_redirect"
			} else {
				getWxInfoByCodeOrOpenid(wxcode,1);
			}
		}else{
			if (getLocalSession('token') == null || getLocalSession('token') == undefined || getLocalSession('token') == '') {
				getWxInfoByCodeOrOpenid(getLocalSession('openid'),2);
			}
		}
	}
	
	/**
	是否微信浏览器
	*/
	function checkWX() {
		if (debug) { return true; }
		if (!isWeiXin()) {
			errorPage()
		}
	}
	
	/**
	是否微信浏览器
	*/
	function isWeiXin() {
		var ua = window.navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	进入校验
	*/
	function check() {
		for (i in g_pubCheck) {
			var func = g_pubCheck[i];
			eval(func);
		}
	}
	
	function getWxInfoByCodeOrOpenid(str, type){
		var params = null;
		if (type == 1){
			params = {
					'interId': 'toc.getWxUserInfoByAuth',
					'channel':'C',
					'code': str
				};
		}else{
			params = {
					'interId': 'toc.getWxUserInfoByAuth',
					'channel':'C',
					'openid': str
				};
		}
		xhq.__runXHQ(params, huancun);	
	}
	
	// 缓存用户资料:缓存到localstorage中，不用失效处理，H5中更新网页资料后同步更新localstorage
	function huancun(data) {
		if (data.status == 0){
			setLocalSession("custId",data.body.custId);
			setLocalSession("openid",data.body.openid);
			setLocalSession("phoneNo",data.body.phoneNo);
			setLocalSession("custNumber",data.body.custNumber);
			setLocalSession("nickName",data.body.nickName || '暂无昵称');
			setLocalSession("headimgUrl",data.body.headimgUrl || DEFAULT_HEADIMG);
			setLocalSession("sex",data.body.sex);
			setLocalSession("userType",data.body.userType);
			setLocalSession("level",data.body.level);
			setLocalSession("inviteCode",data.body.inviteCode || '无邀请码');
			setLocalSession("token",data.body.token);
			setLocalSession("localAddressSession",'')
			setLocalSession("localOrderSession",'')
			setLocalSession("shoppingCartLocalSession",'')
		}else{
			setLocalSession("custId",'');
			setLocalSession("openid",'');
			setLocalSession("phoneNo",'');
			setLocalSession("custNumber",'');
			setLocalSession("nickName",'');
			setLocalSession("headimgUrl",'');
			setLocalSession("sex",'');
			setLocalSession("userType",1);
			setLocalSession("level",'');
			setLocalSession("inviteCode",'');
			setLocalSession("token",'');
			setLocalSession("localAddressSession",'')
			setLocalSession("localOrderSession",'')
			setLocalSession("shoppingCartLocalSession",'')
			$.toast(data.message);
		}
	};

	window.xhq={
		wxPay:function(_payConfig,cb,cberr){
			var payConfig = $.extend({signType:'MD5'},_payConfig);
			cberr = cberr || function(){$.toast('支付失败');};
			function onBridgeReady(){
				WeixinJSBridge.invoke("getBrandWCPayRequest", payConfig,function(res){
					if(res.err_msg == "get_brand_wcpay_request:ok") {
						cb();
					}else{
						cberr();
					}
				});
			}
			if (typeof WeixinJSBridge == "undefined"){
				if( document.addEventListener ){
					document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false);
				}else if (document.attachEvent){
					document.attachEvent("WeixinJSBridgeReady", onBridgeReady);
					document.attachEvent("onWeixinJSBridgeReady", onBridgeReady);
				}
			}else{
				onBridgeReady();
			}
		},
		tobGetVerificationCode:function($btn, phoneNo,cb){
			if($btn.attr('disabled')){
				return;
			}
			var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
			if(!regexp.test(phoneNo)){
				$.toast('手机号码错误');
				return;
			}
			var p = {interId:'tob.getVerificationCode',channel:'C',phoneNo:phoneNo};
			var ov = $btn.html();
			$btn.html('发送中..');
			$btn.attr('disabled','disabled');
			xhq.__runXHQ(p, function(data){
				if (data.status == 0){
					var wt = 60;
					var si = setInterval(function () {
						if (--wt < 1) {
							si && clearInterval(si);
							$btn.attr('disabled', null).html(ov);
						} else {
							$btn.html(ov + '(' + wt + ')')
						}
					}, 1000);
					cb && cb();
				}else{
					$btn.attr('disabled',null);
					$.toast(data.message);
				}
			});
		},
		gotoErrorPage:function(){
			errorPage();
		},
		getToday:function(){
			var now = new Date();
			return now.getFullYear()+"-"+((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"-"+((now.getDate()<10?"0":"")+now.getDate());
		},
		// 初始化wxconfig,并不是每个页面都需要执行该方法，只有需要自定义分享内容的页面才需要执行
		initWXJsConfig: function (otherApi) {
			if (getLocalSession("custId") == null || getLocalSession("custId") == undefined)
				return;
			var postdata = JSON.stringify({'url':location.href});
			var wxconfigurl = g_ajax_url+"/wxconfig";
			var jsApiList = ["onMenuShareTimeline", "onMenuShareAppMessage","scanQRCode"];
			if (otherApi && otherApi.length>0){
				jsApiList = jsApiList.concat(otherApi);
			}
			$.ajax({
				type: 'POST',
				url: wxconfigurl,
				data: postdata,
				success: function (data) {
					var wxConfig = JSON.parse(data);
					wx.config({
                        debug: false,
                        appId: wxConfig.body.appId,
                        timestamp: wxConfig.body.timestamp,
                        nonceStr: wxConfig.body.noncestr,
                        signature: wxConfig.body.sign,
                        jsApiList: jsApiList
                    });
				}
			});
        },	
        // 获取分享url
        getShareUrl:function(){
        	var url = g_domain_url + location.pathname + "?fromCustId="+getLocalSession("custId");
            var _s = location.search;
            var _result = _s.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
            if (_result == null) {
                return url;
            }
            var params = '';
            for (var i = 0; i < _result.length; i++) {
                _tmp = _result[i].substring(1).split('=');
                if (_tmp[0] == 'appId' || _tmp[0] == 'fromCustId' || _tmp[0] == 'openid') {
                    continue;
                }
                params += "&" + _tmp[0] + "=" + _tmp[1];
            }
            return url + params;
        },
        // 检测是否为会员
        isCustomer:function(){
        	if (getLocalSession("userType") == 2)
        		return true;
        	return false;
        },
        getDomainUrl:function(){
        	return g_domain_url+"/dist/html/";
        },
        gotoUrl: function (url, params) {
        	params = params || {};
        	$.extend(params, {version:CUR_HTML_VERSION});
        	// 如果当前url中含有fromCustId,但跳转的url中不包含，则自动追加上
        	if (!params.fromCustId && xhq.getQuery("fromCustId")){
        		params.fromCustId=xhq.getQuery("fromCustId");
        		params.fromUserType=xhq.getQuery("fromUserType")||"0";
        	}else{
        		if (!params.isWs && xhq.getQuery("isWs")){
            		params.isWs=xhq.getQuery("isWs")||"0";
            	}
        	}
            url = xhq.getUrl(url, params);
            location.href = url;
        },
        gotoRegUrl: function (url, params) {
			xhq.gotoUrl("selfreg.html", params);
        },
        getVersion: function(){
        	var s = "version="+CUR_HTML_VERSION;
        	if (!xhq.getQuery("fromCustId") && xhq.getQuery("isWs") == 1)
        		s += "&isWs=1";
        	if (!xhq.getQuery("fromCustId"))
        		return s;
        	else
        		return s+"&fromCustId="+xhq.getQuery("fromCustId")+"&fromUserType="+xhq.getQuery("fromUserType")||"0";
        },
        getUrl: function (url, params) {
            params = params || {};
            if (url.indexOf('http://') == -1) {
                var path, anchor, query, _a = document.createElement('a');
                _a.href = url;
                path = _a.pathname;
                anchor = _a.hash;
                query = xhq.getQuery(null, url);
                query = query || {};
                $.extend(params, query);
                url = path + '?' + $.param(params) + anchor;
            }
            return url;
        },
        getQuery: function (name, url) {
            var _s = location.search;
            if (url) {
                var aa = document.createElement('a');
                aa.href = url;
                _s = aa.search;
            }
            var _tmp, result = {};
            var _result = _s.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
            if (_result == null) {
                return '';
            }

            for (var i = 0; i < _result.length; i++) {
                _tmp = _result[i].substring(1);
                var _tmpStart = _tmp.indexOf('=');
                var _k = _tmp.substr(0, _tmpStart);
                var _v = _tmp.substr(_tmpStart + 1);
                result[_k] = decodeURIComponent(_v);
            }
            return name ? result[name] : result;
        },
        __runXHQ:function (v_params, f_callback, errorcall) {
    		// 初始化channel
    		v_params.channel = "C";
    		// 转为json串
    		var params = JSON.stringify(v_params);
//    		// 获取签名
//    		var signurl = g_ajax_url+"/getSign";
    		var time= Math.round(new Date().getTime()/1000);
    		var token = getLocalSession("token");
    		if (token == null || token == undefined || token == ""){
    			token = "tyuiggl55663ddsd";
    		}
//    		var postdata = JSON.stringify({'time':time,'token':token,'params':params});
//    		$.ajax({
//    			type: 'POST',
//    			url: signurl,
//    			data: postdata,
//    			success: function (data) {
//    				var info = JSON.parse(data);
//    				if (info.status == 0) {
//    					var sign = info.body;
//    					__requestXHQ(sign, time);
//    				} else {
//    					$.toast(data.message);
//    				}
//    			}
//    		});
//    		function __requestXHQ(v_sign, v_time) {
			var url = g_ajax_url+'/service?token=' + token + '&time=' + time;
			$.ajax({
				type: 'POST',
				url: url,
				data: params,
				success: function (data) {
					var ret = JSON.parse(data)
					// 增加登录失效处理，主要针对是一个微信号在不同手机登录的问题
					if (ret.status == 100){ // 登录失效自动重新登录一次
						// 清理缓存
						setLocalSession("custId",'');
						setLocalSession("openid",'');
						setLocalSession("phoneNo",'');
						setLocalSession("custNumber",'');
						setLocalSession("nickName",'');
						setLocalSession("headimgUrl",'');
						setLocalSession("sex",'');
						setLocalSession("userType",1);
						setLocalSession("level",'');
						setLocalSession("inviteCode",'');
						setLocalSession("token",'');
						setLocalSession("localAddressSession",'')
						setLocalSession("localOrderSession",'')
						setLocalSession("shoppingCartLocalSession",'')
						check();
					}else
						f_callback(ret);
				}
			});
//    		}
    	}
	};
	
	 if (!debug)
	 	check();
})(Zepto);


