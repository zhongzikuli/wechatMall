var custId=0;
var userType=0;

var bankname;
var bankcard;
var openbank;
var cardowner;
$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (userType != 2 || custId <= 0){
		$.toast("非合法用户，无法访问");
		xhq.gotoErrorPage();
		return;
	}

	bankname = xhq.getQuery("bn");
	bankcard = xhq.getQuery("bc");
	openbank = xhq.getQuery("pn");
	cardowner = xhq.getQuery("on");
	
	$('#btnGetCode').on('tap',function(e){  
		var mobile = $.trim($('#newPhoneNo').val());
		xhq.tobGetVerificationCode($(this), mobile, function(){
			$.toast('验证码已发送');
		});
	});
	
	$(".go_pay").on('tap',function(){
		// 校验手机号和验证码是否已输入
		var mobile = $.trim($('#newPhoneNo').val());
		var code = $.trim($('#verficode').val());
		if (mobile == null || mobile == "" || mobile.length != 11){
			$.toast("手机号码未录入");
			return;	
		}
		if (code == null || code == "" || code.length != 4){
			$.toast("验证码未录入");
			return;	
		}
		
		// 调用ajax
		$.showIndicator();
		var param={interId:'toc.udpateCustBankInfo',channel:'C',custId:custId,phoneNo:mobile,verificationCode:code,bankname:bankname,bankcard:bankcard,openbank:openbank,cardowner:cardowner};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){ // 只要正常返回body里肯定有值
				$.hideIndicator();
				$.toast("绑定成功");
				xhq.gotoUrl("to_bank1.html",{bankname:bankname,bankcard:bankcard,openbank:openbank,cardowner:cardowner});
			}else{
				$.hideIndicator();
				$.toast(data.message);
			}	
		});
	})
});
