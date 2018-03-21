var custId=0;
var userType=0;
var canDrawMoney;
$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (userType != 2 || custId <= 0){
		$.toast("非合法用户，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	
	// 接收传入的参数
	var bn = xhq.getQuery("bankname");
	$(".bank_name").html(bn+"(尾号:"+(xhq.getQuery('bankcard')||"").slice(-4)+")");
	$(".card_name").html(xhq.getQuery('cardowner'));
	
	// 设置需要显示的银行图标
	if (bn == "中国银行")
		$("#bankImg").attr("src","../img/zgyh.png");
	else if (bn == "工商银行")
		$("#bankImg").attr("src","../img/gsyh.png");
	else if (bn == "建设银行")
		$("#bankImg").attr("src","../img/jsyh.png");
	else if (bn == "招商银行")
		$("#bankImg").attr("src","../img/zsyh.png");
	else if (bn == "农业银行")
		$("#bankImg").attr("src","../img/nyyh.png");
	else if (bn == "邮政银行")
		$("#bankImg").attr("src","../img/yzyh.png");
	
	// 取得可提现金额
	$.showIndicator();
    var param = { interId: 'toc.getIntegralCash', channel: 'C', custId: custId,type:'2' };
	xhq.__runXHQ(param, function (data) {
		$.hideIndicator();
		// 检测返回值
		if (data.status == 0) {
			if (data.body){
//				var sureCommisionMoney = data.body.sureCommisionMoney || 0;//确认收益
//				var initWithdrawMoney = data.body.initWithdrawMoney || 0;//处理中提现
//				var sureWithdrawMoney = data.body.sureWithdrawMoney || 0;//确认提现
				canDrawMoney = data.body.deductionCash;
				
				$(".draw_num").val(canDrawMoney/100);

				if (canDrawMoney<DRAW_MIN_MONEY){
					$.toast("您的可提现金额还不到："+(DRAW_MIN_MONEY/100)+"元，不能提现");
					$('.btn_box>p').removeClass('active');
				}
				$('.btn_box>p').addClass('active');
			}else{
				$.toast("您的可提现金额还不到："+(DRAW_MIN_MONEY/100)+"元，不能提现");
				$('.btn_box>p').removeClass('active');
			}	
			
		}else{
			$.toast(data.message);
		}
	})

	$('.draw_num').on('tap',function () {
		$(".draw_num").val('');
	});
	
	$("#toBind").on('tap',function(){
		xhq.gotoUrl("bind_card2.html",{bankname:xhq.getQuery("bankname"),bankcard:xhq.getQuery("bankcard"),openbank:xhq.getQuery("openbank"),cardowner:xhq.getQuery("cardowner")});
	});
	
	$("#toBank").on('tap',function(){
		// 校验录入的提现金额
		var money = ($(".draw_num").val() || 0) * 100;
		if (money < DRAW_MIN_MONEY){
			$.toast("提现金额不能小于："+(DRAW_MIN_MONEY/100)+"元");
			return;
		}
		if (money>canDrawMoney){
			$.toast("提现金额不能大于可提现金额："+(canDrawMoney/100)+"元");
			return;
		}
		// 提交提现申请
		$.showIndicator();
		var param = { interId:'toc.saveCashDrawlog', custId: custId,type:'2', bankname:xhq.getQuery("bankname"),bankcard:xhq.getQuery("bankcard"),openbank:xhq.getQuery("openbank"),cardowner:xhq.getQuery("cardowner"),money:money};
		xhq.__runXHQ(param, function (data) {
			$.hideIndicator();
			// 检测返回值
			if (data.status == 0) {
				$.toast("提现成功");
				xhq.gotoUrl("to_bank2.html",{bankname:xhq.getQuery("bankname"),bankcard:xhq.getQuery("bankcard"),openbank:xhq.getQuery("openbank"),cardowner:xhq.getQuery("cardowner"),money:money});
			}else{
				$.toast(data.message);
			}
		})
		
	});
});

