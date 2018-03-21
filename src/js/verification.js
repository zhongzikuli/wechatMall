
$(function () {
		var orgId = getLocalSession("orgId")||"";//4
		var opPhone = getLocalSession("opPhone")||"";//15258883811
		if(orgId==""||opPhone==""){
			xhq.gotoUrl('../html/verify_login.html',{type:1})
			return;
		}else{
			$.showIndicator();
			var param={interId:'toc.orgInfoByopPhone',phoneNo:opPhone};
			xhq.__runXHQ(param, function(data){
				$.hideIndicator();
				if (data.status == 2 || data.status == 1){
					xhq.gotoUrl('../html/verify_login.html',{type:1})
				}
			});
		}
		
		// 输入消费码 查询 核销单子
		$(".btn_box").on('click',function(){
			
			var verifyCode = $('#verifyCode').val();
			if (verifyCode == null || verifyCode == ""){
				$.toast("消费码未录入");
				return;	
			}
			if (verifyCode.length != 8){
				$.toast("消费码长度不正确，请检查");
				return;	
			}
			xhq.gotoUrl('../html/verify_cardinfor.html',{verifyCode:verifyCode})
		})
		
		$(".code_btn").on('click',function(){
			
		    xhq.initWXJsConfig();
		})
		
		wx.ready(function(){
			wx.scanQRCode({
			    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			    scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			    success: function (res) {
				    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				    xhq.gotoUrl('../html/verify_cardinfor.html',{verifyCode:result})
			    }
			});
      })
})


	

	
	
	
	