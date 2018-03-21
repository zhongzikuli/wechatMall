var custId=0;
var userType=0;

$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	custNumber = getLocalSession("custNumber") || "";
	
	if(custNumber!=''&&custNumber.length==18){
		custNumber = custNumber.replace(custNumber.substr(4,10),'******');
	}
	
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
	$("#tochgname").on('tap',function(){
		xhq.gotoUrl("change_name.html");
	})
	
	$("#tochgphone").on('tap',function(){
		xhq.gotoUrl("change_phone.html");
	})
	
	$("#toaddr").on('tap',function(){
		xhq.gotoUrl("address_list.html",{pageType:2});
	})
	
	// 加载客户的基本资料
	$(".head_pic").attr('src', getLocalSession("headimgUrl"));
	$("#nickName").html(getLocalSession("nickName"));
	$("#phoneNo").html(getLocalSession("phoneNo") || '未绑定');
	$("#inviteCode").html(getLocalSession("inviteCode"));
	$("#custNumber").html(custNumber);
	
	// 初始化微信jssdk
	xhq.initWXJsConfig(["chooseImage","uploadImage"]);
	
	wx.ready(function () {
	
    });
	
	$("#chooseImg").on('tap',function(){
		wx.chooseImage({
		    count: 1, // 默认9
		    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
		    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		    success: function (res) {
		    	$.showIndicator();
		        // 上传至微信服务器
		        wx.uploadImage({
		            localId: res.localIds.toString(),
		            isShowProgressTips: 0,
		            success: function (res) {
		                toUpyun(res.serverId);
		            }
		        });

		    }
		});
	})
	
	function toUpyun(serverId){
		var param={interId:'toc.updateCustImg',custId:custId,mediaId:serverId};
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				$(".head_pic").attr('src', data.body);
				setLocalSession("headimgUrl",data.body);
			}else{
				$.toast(data.message);
			}
		});
	}
});

