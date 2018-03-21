
$(document).ready(function () {

	// 校验openid
	var openId = getLocalSession("openid") || "";
	var custId = getLocalSession("custId") || "";
	if (openId == ""||custId==""){
		$.toast("未获取到用户资料，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	    var orderId = xhq.getQuery("orderId") || "";
	    var cancelStatus = xhq.getQuery("cancelStatus") || "";
	    
	    //sourceType = 5 线下店合作
		var postdata = {'interId':'toc.getDistinctExpreeNoOrderDetail','channel':'C','orderId':orderId,'cancelStatus':cancelStatus,sourceType:5}
	    
		xhq.__runXHQ(postdata, function(data){
			if (data.status == 0){
			   if(data.body){
				   //转化订单详情
				  // var obj = dataBodyToOrderList(data);
				   var order = data.body.order[0];
				   //地址
				   $('.addressName').html(order.addressName||''); //姓名
				   $('.address-pnone').html(order.addressPhone||''); //电话
				   $('.address-attr').html(order.province+order.city+order.country+order.detailAddress); //详细地址
				   $("#originalPrice").html(order.realPay/100); //商品合计
				   $("#realPay").html("¥"+(order.realPay+(order.expressFee||0))/100);
				   $("#expressFee").html("¥"+(order.expressFee||0)/100);
				   $("#orderId").val(order.orderId);
				   $(".show-time").html(order.createTime+'<br>'+order.orderNo);//下单时间 和 订单编号
				   $("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)
				   
				   var orderDetail = data.body.orderDetailListRows[0];
				   if(orderDetail.verifyStatus=='1'){
					   $(".order-status").html("待消费")
				   }else{
					   $(".order-status").html("已消费")
				   }
				   
				   if(order.sourceId!=custId){
					   $(".code_num").html(orderDetail.verifyCode)
					   $(".code_data").html(orderDetail.yxqzTime)
					   jQuery('#qrcode').qrcode({width: 200,height: 200,text: orderDetail.verifyCode});
				   }
			   }
			}else{
				$.toast(data.message);
			}
		});
})