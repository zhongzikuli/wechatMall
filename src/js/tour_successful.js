//返回首页
$(".back_btn").click(function(){
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

//分享参团
$(".share_btn").click(function(){
	var groupId =  xhq.getQuery("groupId") || ""
	xhq.gotoUrl('../html/tour_goods_share.html',{grouponId:groupId})
})


$(document).ready(function () {
	var orderNo =  xhq.getQuery("orderNo") || ""
	$("#orderNo").html(orderNo)
})