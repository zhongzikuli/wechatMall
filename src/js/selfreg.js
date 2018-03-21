
$(function () {
	$("#nextButton").on('tap',function(){
		// 校验邀请码的长度
		var obj = $("#invitecode");
		var code = obj.val();
		if (code == null || code == undefined || code==""){
			$.toast("请先输入邀请码");
			return;
		}
		code = code.trim();
		if (code.length != 6){
			$.toast("邀请码的长度为6位，请检查");
			return;
		}
		
		// 调用ajax请求确认邀请码是否存在
		$.showIndicator();
		var param={interId:'toc.getCustInfoByInvitecode',channel:'C',inviteCode:code};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0 && data.body != undefined && data.body != null && data.body.custId>0){
				// 跳转到下一页
				$.hideIndicator();
				xhq.gotoUrl("selfreg2.html",{fromCustId:data.body.custId});
			}else{
				$.hideIndicator();
				$.toast("邀请码不正确，请检查");
			}	
		});
	})
})