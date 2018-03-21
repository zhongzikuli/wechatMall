(function($) {
	window.pay = {
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
		//查询某客户的收货地址
		getAddressByCustId:function(cb,cberr){
			var p = {
				rootCode:xhq.userInfo.rootCode,
				custId:xhq.userInfo.id
			};
			xhq.callXHQ(INTERFACE_MAP.tobGetCustomerDeliverAddr,p,cb,cberr);
		},
		//商品详情
		getProductDetail:function(onlineId,cb,cberr){
			var p = {
				rootCode:xhq.userInfo.rootCode,
				onlineId:onlineId,
				orgId:xhq.userInfo.orgInfo.orgId,
				type:1
			};
			xhq.callXHQ(INTERFACE_MAP.tobGoodsdetail,p,cb,cberr);
		},
		tocCreateorder:function(param,cb,cberr){
			var p = $.extend({
				rootCode:xhq.userInfo.rootCode,
				custId:xhq.userInfo.id,
				orgId:xhq.userInfo.orgInfo.orgId,
				uid:xhq.userInfo.operInfo.operId,
				orderChannel:3,
				openId:xhq.userInfo.payOpenId||''
			},param);
			xhq.callXHQ(INTERFACE_MAP.tocCreateorder,p,cb,cberr);
		},
		tobGetVerificationCode:function($btn, phoneNo,cb,cberr){
			if($btn.attr('disabled')){
				return;
			}
			var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
			if(!regexp.test(phoneNo)){
				cberr({message:'手机号码错误'});
				return;
			}
			var p = {
				rootCode:xhq.userInfo.rootCode,
				phoneNo:phoneNo,
				type:5
			};
			var ov = $btn.val();
			$btn.val('发送中..');
			$btn.attr('disabled','disabled');
			xhq.callXHQ(INTERFACE_MAP.tobGetVerificationCode,p,function() {
				var wt = 60;
				var si = setInterval(function () {
					if (--wt < 1) {
						si && clearInterval(si);
						$btn.attr('disabled', null).val(ov);
					} else {
						$btn.val(ov + '(' + wt + ')')
					}
				}, 1000);
				cb && cb();
			},function(res){
				$btn.attr('disabled',null);
				cberr(res) || $.toast(res.message);
			});
		},
		tobOrderdetail:function(id,cb,cberr){
			var p = {
				rootCode:xhq.userInfo.rootCode,
				id:id
			};
			cberr = cberr || function(res){
				$.toast(res.message);
			};

			xhq.callXHQ(INTERFACE_MAP.tobOrderdetail,p,cb,cberr);
		},
		getWXPayConfig:function(openId,orderId,cb,cberr){
			var p= {
				rootCode:xhq.userInfo.rootCode,
				orderId:orderId,
				openid:openId
			};

			cberr = cberr || function(res){
				$.toast(res.message);
			};
			xhq.callXHQ(INTERFACE_MAP.tocWxJsPayOrder,p,cb,cberr);

		},
		//提货
		tobTakegoods:function(params, cb, cberr){
			var p = $.extend({
				rootCode:xhq.userInfo.rootCode,
				orgId:xhq.userInfo.orgInfo.orgId,
				uid:xhq.userInfo.operInfo.operId,
				orderId:''
			},params);
			xhq.callXHQ(INTERFACE_MAP.tobTakegoods,p,cb,cberr);
		},
		confirmOrder:function(params, cb, cberr) {
			var p = $.extend({
				rootCode: xhq.userInfo.rootCode,
				uid: xhq.userInfo.id,
				orderId: ''
			},params);
			xhq.callXHQ(INTERFACE_MAP.tocConfirmOrder, p, cb, cberr);
		},
		getKuaidiUrl:function(params,cb,cberr){
			var p = $.extend({
				rootCode: xhq.userInfo.rootCode,
				com: '',
				nu: ''
			},params);
			xhq.callXHQ(INTERFACE_MAP.tobKuaidi100, p, cb, cberr);
		}
	};
})(Zepto);