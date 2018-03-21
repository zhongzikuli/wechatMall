// 通过分享打开的注册页面：页面url为/sharereg.html?fromCustId=111
var fromCustId;
var custId;
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
			document.title=data.body.nickName+"邀请您开店";
			$("#sharerName1").html(data.body.nickName || "暂无昵称");
			$("#sharerImg").attr('src',data.body.headimgUrl || DEFAULT_HEADIMG);
			
			$.hideIndicator();
		}else{
			$.hideIndicator();
			xhq.gotoErrorPage();
		}	
	});

	$("#city-picker").cityPicker({
		toolbarTemplate: '<header class="bar bar-nav">\ <button id="cancel" class="button button-link pull-left">取消</button>\  <button class="button button-link pull-right close-picker">完成</button>\<h1 class="title"></h1>\ </header>'
	});
	
	// 获取验证码
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
		
		var userName = $.trim($('#userName').val());//用户姓名
		var addressDetail = $.trim($('#addressDetail').val());//详细地址
		var addr = $("#city-picker").val();

		addr = addr.split(" ");
		var province = addr[0];//省
		var city = addr[1];//市
		var country = "";
		if (addr.length = 3) {
			 country = addr[2];//县
		}
		
		
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
		if(userName=="" || userName==null){
			$.toast("用户姓名未录入");
			return;	
		}
		if(addr=="" || addr==null){
			$.toast("省市县未录入");
			return;	
		}
		if(addressDetail=="" || addressDetail==null){
			$.toast("用户详细地址未未录入");
			return;	
		}
		
		// 调用ajax
		$.showIndicator();
		var param={interId:'toc.registerCust',channel:'C',custId:custId,fromCustId:fromCustId,phoneNo:mobile,verificationCode:code,userName:userName,province:province,city:city,country:country,addressDetail:addressDetail};
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
					//删除创建用户地址
					delUserAllAddress();
					$.toast('支付失败');
				});
			}else{
				$.hideIndicator();
				$.toast(data.message);
			}	
		});
	});
	
	//如果用户支付失败，删除当前用户地址信息
	function delUserAllAddress(){
		var param={interId:'toc.delUserAddressByCustId',channel:'C',custId:custId};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				
			}else{
				$.hideIndicator();
				$.toast(data.message);
			}	
		});
	}
});