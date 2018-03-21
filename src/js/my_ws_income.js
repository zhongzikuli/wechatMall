$(document).ready(function () {
	var custId = getLocalSession("custId") || "0";
	var userType = getLocalSession("userType") || "1";
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
	$.showIndicator();
    var param = { interId: 'toc.cashList', channel: 'C', custId:custId,type:'2' };
	xhq.__runXHQ(param, function (data) {
		// 检测返回值
		if (data.status == 0) {
			if (data.body){
				var initCommisionMoney = data.body.initCommisionCash || 0;//处理中收益
				var sureCommisionMoney = data.body.sureCommisionCash || 0;//确认收益
				var initWithdrawMoney = data.body.initWithdrawCash || 0;//消费处理中
				var sureWithdrawMoney = data.body.sureWithdrawCash || 0;//确认消费
				
				//累计收益
				if(sureCommisionMoney>0){
					$('#commisionMoney').html("¥"+(sureCommisionMoney-initWithdrawMoney-sureWithdrawMoney)/100);
					$('#withDrawMoney').html("¥"+(sureCommisionMoney-initWithdrawMoney-sureWithdrawMoney)/100);
					$('#totalMoney').html("¥"+(sureCommisionMoney+initCommisionMoney)/100);
				}
				
				//冻结中
				if(initCommisionMoney>0){
					$('#waitSureMoney').html("¥"+(initCommisionMoney/100));
				}
				var thisDayCash = data.body.thisDayCash;
				var thisWeekCash = data.body.thisWeekCash;
				var thisMonthCash = data.body.thisMonthCash;
				var upMonthCash = data.body.upMonthCash;
				
				$('#thisDayCash').html("¥"+thisDayCash/100);
				$('#thisWeekCash').html("¥"+thisWeekCash/100);
				$('#thisMonthCash').html("¥"+thisMonthCash/100);
				$('#upMonthCash').html("¥"+upMonthCash/100);
				
			}	
			$.hideIndicator();
		}else{
			$.hideIndicator();
			$.toast(data.message);
		}
	})

	$(".down_box .mid_one").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:1});
   	})
   	
   	$(".down_box .mid_two").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:2});
   	})
   	
   	$(".down_box .mid_thr").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:3});
   	})
   	
   	$(".down_box .mid_fou").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:4});
   	})
   	
   	
   	$(".mid_box .mid_one").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:5});
   	})
   	
   	$(".mid_box .mid_two").click(function () {
    	xhq.gotoUrl("ws_income_list.html",{bizType:6});
   	})
   	
    $(".text").click(function () {
    	xhq.gotoUrl("ws_income_list.html");
   	})
   	
   	$(".up_more").click(function () {
    	xhq.gotoUrl("withdraw.html");
   	})
   	
   	
   	$(".box_one").click(function () {
   		var s = $("#commisionMoney").html() || "0";
   		if (s == "0")
   			$.toast("当前暂无详情可供查看");
   		else
   			xhq.gotoUrl("ws_income_list.html");
   	})
   	
//   	$(".profit").click(function () {
//   		var s = $("#commisionMoney").html() || "0";
//   		if (s == "0")
//   			$.toast("当前暂无详情可供查看");
//   		else
//   			xhq.gotoUrl("income_list.html");
//   	})
})