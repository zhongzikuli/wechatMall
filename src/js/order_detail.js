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

	// 校验openid
	var openId = getLocalSession("openid") || "";
	var custId = getLocalSession("custId") || "";
	if (openId == ""||custId==""){
		$.toast("未获取到用户资料，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	openIndicator();
	    var orderId = xhq.getQuery("orderId") || "";
	    var cancelStatus = xhq.getQuery("cancelStatus") || "";
	    
		var postdata = {'interId':'toc.getDistinctExpreeNoOrderDetail','channel':'C','orderId':orderId,'cancelStatus':cancelStatus}
	    
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
				  
				   if(order.payWay==4){
					   $("#payWayContent").html("积分"); //支付方式
					   $("#originalPrice").html(order.realPay+order.deductionPrice); //商品合计
					   $("#realPay").html((order.realPay+(order.expressFee||0)+order.deductionPrice));
					   $("#expressFee").html((order.expressFee||0));
				   }else{
					   $("#payWayContent").html("微信"); //支付方式
					   $("#originalPrice").html("¥"+(order.realPay)/100); //商品合计
					   $("#realPay").html("¥"+(order.realPay+(order.expressFee||0))/100);
					   $("#expressFee").html("¥"+(order.expressFee||0)/100);
					   $("#deductionPrice").html("¥"+(order.deductionPrice||0)/100); 
				   }
				   
				   $("#orderId").val(order.orderId);
				   $(".show-time").html(order.createTime+'<br>'+order.orderNo);//下单时间 和 订单编号
				    var html="";
				    if (order.orderStatus == '1') {
						//待支付
				    	if(order.payWay==4){
				    	   $("#waitRealPay").html(order.realPay);
				    	}else{
				    	   $("#waitRealPay").html("¥"+order.realPay/100);
				    	}
				    	loadTitle()
					}else if (order.orderStatus == '2' && order.orderType=='1') {
						//已发货
						if(order.payWay==4){
							$("#sumTotalRefund").html(order.sumTotalRefund)		
						}else{
							$("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)		
						}
								
					}else if (order.orderStatus == '2' && order.orderType=='0') {
						//待成团
						$("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)				
					}else if (order.orderStatus == '4' && order.cancelStatus=='1') {
						//已发货
						if(order.payWay==4){
							$("#sumTotalRefund").html(order.sumTotalRefund)
						}else{
							$("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)
						}
						$("#expressContent").html(deliverHtml(data.body.orderDetailListRows,html));					
					} else if (order.orderStatus == '5' && order.cancelStatus=='1') {
						if(order.payWay==4){
							$("#sumTotalRefund").html(order.sumTotalRefund)
						}else{
							$("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)
						}
						//已完成
						$("#expressContent").html(deliverHtml(data.body.orderDetailListRows,html));
						
					} else if (order.cancelStatus == '3') {
						//已退货
						$("#sumTotalRefund").html("¥"+order.sumTotalRefund/100)
					}
			   }
			   hideIndicator();
			}else{
				$.toast(data.message);
				hideIndicator();
			}
		});
		
	 //加载标题	
     function loadTitle(){
	    	var param = { interId: 'toc.getAvoidExpressFee', channel: 'C' };
	    	xhq.__runXHQ(param, function (data) {
	    		if (data.status == 0) {
	    			var unpayDelay = data.body.unpayDelay;
	    			$("#waitPayTitle").html("未支付订单将在"+unpayDelay+"分钟之后关闭，请尽快完成支付");
	    		} else {
	    			hideIndicator();
	    			$.toast(data.message);
	    		}
	    	})
   	
	 }
     
	 function deliverHtml(orderDetailList,html){
			for(var i=0;i<orderDetailList.length;i++){
				var orderDetail = orderDetailList[i];
				var showNameList = orderDetail.details.split("|");
				html += '<div class="content-block4">';
				html += '<div class="package">';
				if(orderDetail.expressNo!=null && orderDetail.expressNo!=undefined && orderDetail.expressNo!='' && orderDetail.expressNo!='自提'){
					html += '<span>包裹'+(i+1)+'</span><button type="button" expressNo='+orderDetail.expressNo+' expressType='+orderDetail.expressType+'>追踪物流</button>'
				}else{
					html += '<span>包裹'+(i+1)+'</span>'
				}
				html += '</div>';
				html += '<hr>';
				html += '<div class="package-product">';
				html += '<div class="package-product-number">';
				if(orderDetail.expressNo!=null && orderDetail.expressNo!=undefined && orderDetail.expressNo!=''){
				    html += '运单编号：'+orderDetail.expressNo+'';
				}else{
					html += '运单编号：';
				}
				html += '</div>';
				html += '<div class="package-product-name">';
				for(var j=0;j<showNameList.length;j++){
					html += '<p>商品'+convertToChinese(j+1)+'：'+showNameList[j]+' </p>'
				}
                html += '</div>';
                html += ' </div></div>'
			}
			
			return html;
           	
		}
	    
	    $("#mailList").on("click",".cancel-order",function(){
	    	var orderId = $("#orderId").val();
	    	var custId = getLocalSession("custId")||"";
	    			$.confirm('确定要取消订单吗？', function () {
	    			
	    			var postdata = { 'interId': 'toc.closeOrder', 'channel': 'C', 'orderId': orderId,'custId':custId};
	    			xhq.__runXHQ(postdata, function (data) {
	    				if (data.status == 0) {
	    					xhq.gotoUrl('order_close.html',{orderId:orderId})
	    				}else{
	    					$.toast(data.message);
	    				}
	    			})
	    		})

	    	});
	    	
	     $("#mailList").on("click",".pay",function(){
	    	var orderId = $("#orderId").val();
	    	var custId = getLocalSession("custId")||"";
	    	if (custId == ""){
	    		$.toast("未获取到用户资料，无法访问");
	    		xhq.gotoErrorPage();
	    		return;
	    	}
	    			
	    	var postdata = { 'interId': 'toc.getPayCode', 'channel': 'C', 'orderId': orderId,'custId':custId};
	    	xhq.__runXHQ(postdata, function (data) {
	    				if (data.status == 0) {
	    					
	    					var payConfig = {};
	    					payConfig['appId'] = data.body.weiData.appId;
	    					payConfig['nonceStr'] = data.body.weiData.nonceStr.toString();
	    					payConfig['package'] = data.body.weiData.packageInfo;
	    					payConfig['paySign'] = data.body.weiData.paySign;
	    					payConfig['timeStamp'] = data.body.weiData.timeStamp+'';
	    		            
	    					var orderNo = data.body.orderNo;
	    					var groupId = data.body.groupId || "";
	    					var channelType = data.body.channelType;
	    					
	    					var mallType = getLocalSession("mallType")||"";
	    					//把下单缓存清空
	    					setLocalSession("localOrderSession", "");
	    					//从购物车按钮下单的，清除购物车商品信息
	    					if(mallType=='gwcgm'){
	    						var unCheckShoppingCartLocalSession = getLocalSession("unCheckShoppingCartLocalSession");
	    						if(unCheckShoppingCartLocalSession!=null || unCheckShoppingCartLocalSession != undefined || unCheckShoppingCartLocalSession!=''){
	    							unCheckShoppingCartLocalSession = "";
	    						}
	    						setLocalSession("shoppingCartLocalSession", unCheckShoppingCartLocalSession)
	    					}
	    					
	    					xhq.wxPay(payConfig, function (res) {
	    						if(channelType=='4'){
	    							xhq.gotoUrl('../html/tour_successful.html',{orderNo:orderNo,channelType:channelType,groupId:groupId});
	    						}else{
	    							xhq.gotoUrl('../html/paysuccess.html',{orderNo:orderNo,channelType:channelType,groupId:groupId});
	    						}
	    					},function(){
	    						xhq.gotoUrl('../html/order_list.html');
	    					});
	    					
	    				}else{
	    					$.toast(data.message);
	    				}
	    			})

	    	})
	    	
	    
	    $("#expressContent").on("click", "button", function () {
	    	var expressNo = $(this).attr("expressNo");
			var expressType = $(this).attr("expressType");
			//var url = "http://m.kuaidi100.com/index_all.html?type=yuantong&postid=809310073959"
			var url = "http://m.kuaidi100.com/index_all.html?postid="+expressNo
			xhq.gotoUrl(url)
	    })
	    
	     // 追踪物流
//		function traceExpress() {
//			var expressNo = $(this).attr("expressNo")
//			var expressType = $(this).attr("expressType")
//			var url = "http://m.kuaidi100.com/index_all.html?postid="+expressNo
//			xhq.gotoUrl(url,{orderId:orderId})
//			var postdata = {'interId':'toc.getKuaidi100','channel':'C',orderId:orderId}
//		    xhq.__runXHQ(postdata, function(data){
//				if (data.status == 0){
//					
//				}else{
//					$.toast(data.message);
//				}
//			})
			//xhq.gotoUrl(url,{orderId:orderId})
//		}
		
		
		 
		var N = [  
                "零", "一", "二", "三", "四", "五", "六", "七", "八", "九"  
            ]; 
		function convertToChinese(num){  
            var str = num.toString();  
            var len = num.toString().length;  
            var C_Num = [];  
            for(var i = 0; i < len; i++){  
                C_Num.push(N[str.charAt(i)]);  
            }  
            return C_Num.join('');  
        }

	
})