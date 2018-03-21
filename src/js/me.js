function openIndicator(){
	$.showIndicator();
	isIndicator = true;
}

function hideIndicator(){
	if (isIndicator){
		$.hideIndicator();
		isIndicator = false;
	}
	loading = false;
}

$(document).ready(function () {
	// 如果是分享打开首页，且检测到分享者是微商，显示精选菜单
	if (xhq.getQuery("fromUserType") == 2){
		
	}else{
		$('#toshop').css('display','none');
	}
	
	// 校验openid
	var openId = getLocalSession("openid") || "";
	if (openId == ""){
		xhq.gotoErrorPage();
		return;
	}
	openIndicator();
	
	// 重新刷新会员基本资料
	var postdata = {interId: 'toc.getWxUserInfoByAuth','openid': openId};
	xhq.__runXHQ(postdata, function(data){
		if (data.status == 0){
			setLocalSession("custId",data.body.custId);
			setLocalSession("openid",data.body.openid);
			setLocalSession("nickName",data.body.nickName || '暂无昵称');
			setLocalSession("headimgUrl",data.body.headimgUrl || DEFAULT_HEADIMG);
			setLocalSession("sex",data.body.sex);
			setLocalSession("userType",data.body.userType);
			setLocalSession("level",data.body.level);
			setLocalSession("inviteCode",data.body.inviteCode || '无邀请码');
			setLocalSession("token",data.body.token);
			setLocalSession("phoneNo",data.body.phoneNo || '未绑定');
			
			// 刷新页面上的会员基本资料
			$("#meImg").attr("src", data.body.headimgUrl || DEFAULT_HEADIMG);
			if (data.body.userType == 2)
				$("#meLevel").html(data.body.level || '店长');
			else
				$("#meLevel").html(data.body.level || '消费者');
			$("#meName").html(data.body.nickName || '暂无昵称');
			$("#inviteCode").html(data.body.inviteCode || '无邀请码');
			
			// 加载销售数据 及家族成员
			loadSaleData();
			
			// 处理购物车的数量
			getCartNumber();
		}else{
			setLocalSession("custId",'');
			setLocalSession("openid",'');
			setLocalSession("nickName",'');
			setLocalSession("headimgUrl",'');
			setLocalSession("sex",'');
			setLocalSession("userType",1);
			setLocalSession("level",'');
			setLocalSession("inviteCode",'');
			setLocalSession("token",'');
			hideIndicator();
			$.toast(data.message);
		}
	});
	
	function loadSaleData(){
		var param = { interId: 'toc.moneyList', channel: 'C', custId:getLocalSession("custId"),type:'2' };
		xhq.__runXHQ(param, function (data) {
			hideIndicator();
			// 检测返回值
			if (data.status == 0) {
				if (data.body){
					var initCommisionMoney = data.body.initCommisionMoney || 0;
					var sureCommisionMoney = data.body.sureCommisionMoney || 0;
					var initWithdrawMoney = data.body.initWithdrawMoney || 0;
					var sureWithdrawMoney = data.body.sureWithdrawMoney || 0;
					var countOrderMoney = data.body.countOrderMoney || 0;
					var curCommisionMoney = data.body.curCommisionMoney || 0;
					
					if(initCommisionMoney>0||sureCommisionMoney>0){
						$('#commisionMoney').html((sureCommisionMoney - initWithdrawMoney - sureWithdrawMoney));
					}
				}
			}else{
				hideIndicator();
				$.toast(data.message);
			}
		})
	}
	
	function getCartNumber(){
		var cartStr = getLocalSession("shoppingCartLocalSession")||"";
		if (cartStr == ""){
			
		}else{
			var cartObj = JSON.parse(cartStr);
			if (cartObj.body)
				$("#cartNumber").html(cartObj.body.length || 0);
		}
	}
	
	// 处理页面的绑定事件
	$("#editCust").on('tap',function(){
		xhq.gotoUrl('custinfo.html');
	});
	$("#toIncomDet").on('tap',function(){
		xhq.gotoUrl('my_income.html');
	});
	$(".my_cart").on('tap',function(){
		xhq.gotoUrl('shoppingcart.html');
	});
	$(".my_order").on('tap',function(){
		xhq.gotoUrl('order_list.html');
	});
	$(".my_income").on('tap',function(){
		xhq.gotoUrl('my_income.html');
	});
	$(".toCredit").on('tap',function(){
		xhq.gotoUrl('credit_goods_list.html');
	});
	$(".setting").on('tap',function(){
		xhq.gotoUrl('custinfo.html');
	});
	$(".my_family").on('tap',function(){
		if (getLocalSession("userType") != 2){
			xhq.gotoRegUrl();
			return;
		}
		xhq.gotoUrl('my_family.html');
	});
	$(".my_msg").on('tap',function(){
		xhq.gotoUrl('my_msg.html');
	});
	$(".toChange").on('tap',function(){
		xhq.gotoUrl("change_list.html");
	});
	$(".toInvite").on('tap',function(){
		if (getLocalSession("userType") !=2){
			xhq.gotoRegUrl();
			return;
		}
		xhq.gotoUrl("invite_friend.html");
	});
	
	$("#totype").on("tap",function(){
    	xhq.gotoUrl("goodtypes.html");
    })
    $("#tohome").on("tap",function(){
    	xhq.gotoUrl("home.html");
    })
    $("#totour").on("tap",function(){
    	xhq.gotoUrl("tour.html");
    })
    $(".toNet").on("tap",function(){
    	xhq.gotoUrl("search_result.html",{topTypeName:'网咖'});
    })
    $("#toshop").on("tap",function(){
    	xhq.gotoUrl("ws_shop.html");
    })
})

	