// 支付成功 ＝＝ 查看订单
$("#order-card").click(function(){
	xhq.gotoUrl("order_list.html?version="+xhq.getVersion());
})
// 支付成功 ＝＝ 返回首页
$("#index").click(function(){
	if (xhq.getQuery("fromUserType") == 2)
		xhq.gotoUrl("home.html?version="+xhq.getVersion());
	else{
		if (xhq.getQuery("isWs") == 1){
			xhq.gotoUrl("ws_home.html?version="+xhq.getVersion());
		}else{
			xhq.gotoUrl("home.html?version="+xhq.getVersion());
		}
	}
})

////拼团成功 ＝＝返回首页
$(".back_btn").click(function(){
	xhq.gotoUrl("tour.html?version="+xhq.getVersion());
})

//拼团成功 ＝＝ 分享参团
$(".share_btn").click(function(){
	var groupId =  xhq.getQuery("groupId") || ""
	var orderNo =  xhq.getQuery("orderNo") || ""
	var channelType =  xhq.getQuery("channelType") || ""
    xhq.gotoUrl('../html/tour_goods_share.html',{grouponId:groupId})
})

$(document).ready(function () {
	// 校验custId
	var custId = getLocalSession("custId") || "";
	var orderNo =  xhq.getQuery("orderNo") || ""
    var channelType =  xhq.getQuery("channelType") || ""
    var groupId =  xhq.getQuery("groupId") || ""
     $("#orderNo").html(orderNo)
	 //参团业务
     if(channelType=='4'){
    	var postdata = { 'interId': 'toc.getGrouponByGroupId', 'channel': 'C', 'custId': custId,'groupId':groupId};
     	xhq.__runXHQ(postdata, function (data) {
     		if(data.status == 0){
     			$("#groupContent").html("开团成功！")
     		}
     	})
     }else if(channelType=='3'){
    	 $("#successContent").html("兑换成功！")
     }
	
})