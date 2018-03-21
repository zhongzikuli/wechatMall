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
		var param={interId:'toc.bindOpPhone',phoneNo:mobile,verificationCode:code};
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			var type = xhq.getQuery("type")||"";
			if (data.status == 0){
				setLocalSession("orgId",data.body.orgId);
				setLocalSession("opPhone",data.body.opPhone);
				setLocalSession("opLinkman",data.body.opLinkman);
				if(type=='1'){
					xhq.gotoUrl('../html/verification.html',{orgId:data.body.orgId,opPhone:data.body.opPhone})
				}else{
					xhq.gotoUrl('../html/verify_order_search.html',{orgId:data.body.orgId,opPhone:data.body.opPhone})
				}
				
			}else{
				$.toast(data.message);
			}
		});
	})