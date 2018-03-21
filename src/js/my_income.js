$(document).ready(function () {
	var custId = getLocalSession("custId") || "0";
	var userType = getLocalSession("userType") || "1";
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
	$.showIndicator();
    var param = { interId: 'toc.moneyList', channel: 'C', custId: custId,type:'2' };
	xhq.__runXHQ(param, function (data) {
		// 检测返回值
		if (data.status == 0) {
			if (data.body){
				var initCommisionMoney = data.body.initCommisionMoney || 0;//处理中收益
				var sureCommisionMoney = data.body.sureCommisionMoney || 0;//确认收益
				var initWithdrawMoney = data.body.initWithdrawMoney || 0;//处理中提现
				var sureWithdrawMoney = data.body.sureWithdrawMoney || 0;//确认提现
				
				//累计收益
				if(initCommisionMoney>0||sureCommisionMoney>0){
					$('#commisionMoney').html((sureCommisionMoney-initWithdrawMoney-sureWithdrawMoney));
				}
				//冻结中
				if(initCommisionMoney>0||initWithdrawMoney>0){
					$('#blockMoney').html((initCommisionMoney));
				}
				//可提现
				if(sureCommisionMoney>0||initWithdrawMoney>0||sureWithdrawMoney>0){
					$('#withdrawMoney').html((sureCommisionMoney-initWithdrawMoney-sureWithdrawMoney));
				}
			}	
			$.hideIndicator();
		}else{
			$.hideIndicator();
			$.toast(data.message);
		}
	})

    $(".up_more").click(function () {
    	//$.toast("该功能当前暂未开放，敬请期待");
    	xhq.gotoUrl("consume_list.html");
   	})
   	
   	$(".big_circle").click(function () {
   		var s = $("#commisionMoney").html() || "0";
   		xhq.gotoUrl("income_list.html");
   	})
   	
//   	$(".profit").click(function () {
//   		var s = $("#commisionMoney").html() || "0";
//   		if (s == "0")
//   			$.toast("当前暂无详情可供查看");
//   		else
//   			xhq.gotoUrl("income_list.html");
//   	})
})