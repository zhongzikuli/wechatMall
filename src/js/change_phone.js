var custId=0;
var userType=0;

$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
	// 获取验证dccg
	$('#btnGetCode').on('tap',function(e){  
		var mobile = $.trim($('#newPhoneNo').val());
		xhq.tobGetVerificationCode($(this), mobile, function(){
			$.toast('验证码已发送');
		});
	});
	
	// 绑定
	$(".btn_box").on('tap',function(){
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
		
		$.showIndicator();
		var param={interId:'toc.updateCustInfo',phoneNo:mobile,verificationCode:code,custId:custId};
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				$.toast("保存成功");
				setLocalSession("phoneNo",mobile);
			}else{
				$.toast(data.message);
			}
		});
	})
	
});
