// 通过分享打开的注册页面：页面url为/sharereg.html?fromCustId=111
var fromCustId;
var custId
$(function () {
	// 从参数中解析得到fromCustId
	fromCustId = xhq.getQuery("fromCustId") || 0;
	if (fromCustId == 0){
		// 跳转到错误页面
		xhq.gotoErrorPage();
		return;
	}
	custId = getLocalSession("custId");
	if (custId == 0){
		xhq.gotoErrorPage();
		return;
	}
	
	// 根据传入的分享者信息获取分享者资料
	$.showIndicator();
	var param={interId:'toc.getCustInfoByInvitecode',channel:'C',fromCustId:fromCustId};
	xhq.__runXHQ(param, function(data){
		if (data.status == 0 && data.body != undefined && data.body != null && data.body.custId>0){
			$("#sharerName1").html(data.body.nickName || "");
			$("#sharerImg").attr('src',data.body.headimgUrl || DEFAULT_HEADIMG);
			
			$.hideIndicator();
		}else{
			$.hideIndicator();
			xhq.gotoErrorPage();
		}	
	});
	
	// 获取验证dccg
	$('#btnGetCode').on('tap',function(e){  
		var mobile = $.trim($('#newPhoneNo').val());
		xhq.tobGetVerificationCode($(this), mobile, function(){
			$.toast('验证码已发送');
		});
	});
	
	$('#buttonPay').on('tap',function(e){ 
		// 校验手机号和验证码是否已输入
		var mobile = $.trim($('#newPhoneNo').val());
		var code = $.trim($('#verficode').val());
		if (mobile == null || mobile == ""){
			$.toast("手机号码未录入");
			return;	
		}
		if (mobile.length != 11){
			$.toast("手机号码长度不正确，请检查");
			return;	
		}
		if (code == null || code == ""){
			$.toast("验证码未录入");
			return;	
		}
		if (code.length != 4){
			$.toast("验证码长度为4位，请检查");
			return;	
		}
		
		// 调用ajax
		$.showIndicator();
		var param={interId:'toc.registerCust',channel:'C',custId:custId,fromCustId:fromCustId,phoneNo:mobile,verificationCode:code};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){ // 只要正常返回body里肯定有值
				var payConfig = {};
				payConfig['appId'] = data.body.appId;
				payConfig['nonceStr'] = data.body.nonceStr.toString();
				payConfig['package'] = data.body.packageInfo;
				payConfig['paySign'] = data.body.paySign;
				payConfig['timeStamp'] = data.body.timeStamp+'';

				xhq.wxPay(payConfig, function (res) {
					$.hideIndicator();
					setLocalSession("userType",2);
					xhq.gotoUrl('open_end.html');
				},function(){
					$.hideIndicator();
					$.toast('支付失败');
				});
			}else{
				$.hideIndicator();
				$.toast(data.message);
			}	
		});
	});
})