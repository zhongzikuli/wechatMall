var mySwiper = new Swiper('.swiper-container', {
	// loop:false,
	// slidesPerView :'auto',
	// loopedSlides :7,
	// longSwipes : false,
	width: 40,
	freeMode: true,
	noSwiping: true,
})
//全局变量
var pageNo = 0;
var pageSize = 10;
// 刷新相关
var $content = null;
var loading = false;
//订单状态
var orderStatus = '';
//订单退货状态
var cancelStatus = '';
//tab切换相关
var preTabId = $("#all").attr("id");;

function openIndicator() {
	$.showIndicator();
	isIndicator = true;
}

function hideIndicator() {
	if (isIndicator) {
		$.hideIndicator();
		isIndicator = false;
	}
	loading = false;
}


$(document).ready(function () {

	
	// 校验openid
	var openId = getLocalSession("openid") || "";
	var custId = getLocalSession("custId") || "";
	if (openId == ""||custId=="") {
		$.toast("未获取到用户资料，无法访问");
		xhq.gotoErrorPage();
		return;
	}

	//注册下拉刷新页面
	$(document).on("pageInit", "#page-ptr", function (e, id, page) {
		$content = $(page).find(".content-block");

		$(page).on('infinite', function (e) {
			if (loading) return;
			openIndicator();
			loading = true;
			setTimeout(function () {
				isAppendMode = 1;
				loadData();
				$.refreshScroller();
			}, 1000);
		});
	});

	// 注册tab切换事件
	$(".swiper-slide").on('tap', function (e) {
		var curtabid = $(this).attr("id");
		var reload = 0;

		if (curtabid != preTabId) {
			// tab切换了，需要重新加载
			if (curtabid == "all") {
				orderStatus = '';
				cancelStatus = '';
			} else if (curtabid == "waitPay") {
				orderStatus = 1;
				cancelStatus = 1;
			} else if (curtabid == "waitDeliver") {
				orderStatus = 2;
				cancelStatus = 1;
			} else if (curtabid == "deliver") {
				orderStatus = 4;
				cancelStatus = 1;
			} else if (curtabid == "finish") {
				orderStatus = 5;
				cancelStatus = 1;
			} else if(curtabid == "close"){
				orderStatus = 6;
				cancelStatus = 1;
			}else if(curtabid == "refund"){
				orderStatus = '';
				cancelStatus = 3;
			}
			reload = 1;

			$("#" + preTabId).removeClass("active")
			$(this).addClass("active");
			preTabId = curtabid;
		}

		if (reload == 1) {
			openIndicator();
			pageNo = 0;
			loadData();
			// 重新绑定上拉加载
			$.attachInfiniteScroll($content);
			$('.infinite-scroll-preloader').css("display", "block");
		}
	});

	$.init();

	loadData();

	openIndicator();

	function loadData() {

		pageNo = pageNo + 1;
		
		var postdata = { 'interId': 'toc.getOrderDetailForPageList', 'channel': 'C', 'pageNo': pageNo, 'pageSize': pageSize, 'custId': custId, 'orderStatus': orderStatus,'cancelStatus':cancelStatus };
		xhq.__runXHQ(postdata, function (data) {
		
			if (data.status == 0) {
				if (data.body) {
					//转化订单详情
					var obj = dataBodyToOrderList(data);
                    
					var html = "";
					//加载数据
					if(pageNo==1&&obj.length==0){
						
						$("#tabContent").html(nullHtml(html))
						
						$.detachInfiniteScroll($content);
						$('.infinite-scroll-preloader').remove();
						hideIndicator();
						return;
					}
					
					for (var i = 0; i < obj.length; i++) {
						var order = obj[i];
						
						if (order.orderStatus == '1' && order.cancelStatus == '1') {
							//待支付
							html = html + waitPayHtml(order)
						} else if (order.orderStatus == '2' && order.cancelStatus == '1' && order.orderType =='1') {
							//待发货
							html = html + waitDeliverHtml(order)
						} else if (order.orderStatus == '2' && order.cancelStatus == '1' && order.orderType =='0') {
							//邮寄待成团
							html = html + waitGroupHtml(order)
						} else if (order.orderStatus == '4' && order.cancelStatus == '1') {
							//已发货
							html = html + deliverHtml(order)
						} else if (order.orderStatus == '5' && order.cancelStatus == '1' && order.orderType =='0') {
							//自提待成团
							html = html + waitGroupHtml(order)
						} else if (order.orderStatus == '5' && order.cancelStatus == '1' && order.orderType =='1' && order.sourceType != '5') {
							//已完成
							html = html + finishHtml(order)
						} else if (order.orderStatus == '5' && order.cancelStatus == '1' && order.orderType =='1' && order.sourceType == '5') {
							//已完成  核销订单
							html = html + finishVerifyHtml(order)
						} else if (order.orderStatus == '6') {
							//已关闭
							html = html + closeHtml(order)
						} else if (order.cancelStatus == '3'){
							//已退货
							html = html + refundHtml(order)
						}
					}

					if (pageNo == 1) {
						//覆盖
						$("#tabContent").html(html)
					} else {
						//追加
						$("#tabContent").append(html)
					}

					// 当数据已全部加载完成，则不允许上拉加载
					if (!data.body || data.body.length < pageSize) {
						$.detachInfiniteScroll($content);
						$('.infinite-scroll-preloader').remove();
					}
					loading = false;
				}else{
					$("#tabContent").html(nullHtml(html))
					
					$.detachInfiniteScroll($content);
					$('.infinite-scroll-preloader').remove();
					hideIndicator();
					return;
				}

				hideIndicator();
			} else {
				$.toast(data.message);
				hideIndicator();
			}
		})
	}

	function dataBodyToOrderList(data) {
		
		//alert(JSON.stringify(data))
		var obj = [];
		for (var i = 0; i < data.body.length; i++) {
			var boydata = data.body[i];
			var orderList = {};
			orderList.orderId = boydata.orderId;
			orderList.custName = boydata.custName;
			orderList.orderStatus = boydata.orderStatus;
			orderList.cancelStatus = boydata.cancelStatus;
			orderList.orderType = boydata.orderType;
			orderList.groupId = boydata.groupId
			orderList.sourceType = boydata.sourceType
			orderList.channel = boydata.channel
			
			var list = boydata.orderDetails.split("|");
			var orderDetailList = [];
			for (var j = 0; j < list.length; j++) {
				var detail = list[j].split(",");
				var orderDetail = {};
				for (var k = 0; k < detail.length; k++) {
					var kv = detail[k].split("#");
					if (kv[0] == 'orderDetailId') {
						orderDetail.orderDetailId = kv[1];
					} else if (kv[0] == 'orderId') {
						orderDetail.orderId = kv[1];
					} else if (kv[0] == 'showName') {
						orderDetail.showName = kv[1];
					} else if (kv[0] == 'purchasePrice') {
						orderDetail.purchasePrice = kv[1];
					} else if (kv[0] == 'salePrice') {
						orderDetail.salePrice = kv[1];
					} else if (kv[0] == 'num') {
						orderDetail.num = kv[1];
					} else if (kv[0] == 'bigPic') {
						orderDetail.bigPic = kv[1];
					} else if(kv[0] == 'cancelStatus'){
						orderDetail.cancelStatus = kv[1];
					}else if(kv[0] == 'verifyStatus'){
						orderDetail.verifyStatus = kv[1];
					}
				}
				orderDetailList.push(orderDetail);
			}
			orderList.orderDetailList = orderDetailList;
			obj.push(orderList);
		}
		return obj;
	}
	
	function nullHtml(html){
		html += '<div class="content-block-2">';
		html += '<img src="../img/empty@3x.png" alt="">';
		html += '<p>还没有相关的订单呢</p >';
		html +=  '</div>';
		return html;
	}

	function orderDetailList(order, html) {
        //alert(JSON.stringify(order))
		var orderDetailList = order.orderDetailList;
		for (var i = 0; i < orderDetailList.length; i++) {

			var orderDetail = orderDetailList[i];
			
			html += '<li>';
			html += '<a href="#" class="item-link item-content">';
			html += '<div class="item-media"><img src=' + orderDetail.bigPic + ' style="width: 3.5rem;height:3.5rem;">';
			if(orderDetail.cancelStatus=='3'){
				html += '<div><img src="../img/icon_tui.png" alt=""></div>';
			}
			html += '</div>';
			html += '<div class="item-title-row">';
			html += '<div class="item-text">' + orderDetail.showName + '</div>';
			if(order.channel==3){//积分兑换
				html += '<div class="item-after"><span>' + orderDetail.salePrice + '</span></div>';
				if(orderDetail.purchasePrice!='' && orderDetail.purchasePrice!='0'){
					html += '<div class="item-after1"><span>' + orderDetail.purchasePrice + '</span></div>'
				}
			}else{
				html += '<div class="item-after">￥<span>' + orderDetail.salePrice/100 + '</span></div>';
				if(orderDetail.purchasePrice!='' && orderDetail.purchasePrice!='0'){
					html += '<div class="item-after1">￥<span>' + orderDetail.purchasePrice/100 + '</span></div>'
				}
			}
			if(orderDetail.purchasePrice!='' && orderDetail.purchasePrice!='0'){
				html += '<div class="item-after1">￥<span>' + orderDetail.purchasePrice/100 + '</span></div>'
			}
			html += '<div class="item-after2">x<span>' + orderDetail.num + '</span></div>';
			html += '<div class="item-subtitle"></div>';
			html += '</div></a></li>'
		}

		return html;
	}
	
	

	//待支付
	function waitPayHtml(order) {

		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>待支付</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '<div class="order-function">';
		html += '<button class="cancel-order">取消订单</button>';
		html += '<button class="pay" style=" color: rgba(222,63,55,1);">付款</button>';
		html += '</div>';
		html += '</div></div>';
		return html;
	}

	//待发货
	function waitDeliverHtml(order) {
		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">'
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>待发货</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '</div></div>';
		return html
	}
	
	//待成团
	function waitGroupHtml(order) {
		html = '<div class="content-block-1" groupId='+order.groupId+' orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">'
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>待成团</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '<div class="order-function">';
		html += '<button class="share_tour">分享拼团</button>';
		html += '</div>';
		html += '</div></div>';
		return html
	}
	
	//待自提
	function waitPickHtml(order) {
		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">'
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>待自提</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '</div></div>';
		return html
	}

	//已发货
	function deliverHtml(order) {
		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">'
		html += '<span>收货人: ' + order.custName + '</span> <button>已发货</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '<div class="order-function">'
		html += '<button class="order-zhui order-signin--1">确认签收</button>';
		html += '<button class="order-zhui order-signin--2">追踪物流</button>';
		html += '</div>';
		html += '</div></div>';
		return html;
	}
	
	//核销订单
	function finishVerifyHtml(order) {
		
		var verifyStatus = order.orderDetailList[0].verifyStatus
		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">';
		if(verifyStatus == '1'){
			html += '<span>收货人: ' + order.custName + '</span> <button>待消费</button>';
		}else{
			html += '<span>收货人: ' + order.custName + '</span> <button>已消费</button>';
		}
		
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '<div class="order-function">';
		if(verifyStatus == '1'){
			html += '<button class="verifyCode">查看券码</button>';
		}else{
			
		}
		html += '</div>';
		html += '</div></div>';
		return html;
	}

	//已完成
	function finishHtml(order) {

		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>已完成</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '</div></div>';
		return html;
	}

	//已关闭
	function closeHtml(order) {
		html = '<div class="content-block-1"  orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>已关闭</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '</div></div>';
		return html;
	}
	
	//退货
	function refundHtml(order) {
		html = '<div class="content-block-1" orderId=' + order.orderId + ' orderStatus='+order.orderStatus+' cancelStatus='+order.cancelStatus+' orderType='+order.orderType+' sourceType='+order.sourceType+'><div class="order_box">';
		html += '<div class="order-address">';
		html += '<span>收货人: ' + order.custName + '</span> <button>已退货</button>';
		html += '</div>';
		html += '<div class="list-block media-list">';
		html += '<ul>';
		html = orderDetailList(order, html);
		html += '</ul></div>';
		html += '</div></div>';
		return html;
	}
	
	
	
	//查看券码详情
	$("#tabContent").on("click", ".verifyCode", function () {
		var orderId = $(this).parents(".content-block-1").attr("orderId")
		xhq.gotoUrl('../html/order_verify.html',{orderId:orderId})
	})
	
	//分享成团
	$("#tabContent").on("click", ".share_tour", function () {
		var groupId = $(this).parents(".content-block-1").attr("groupId")
		xhq.gotoUrl('../html/tour_goods_share.html',{grouponId:groupId})
		
	})
	
	//取消订单,数据需要写
	$("#tabContent").on("click", ".cancel-order", function () {
		var orderId = $(this).parents(".content-block-1").attr("orderId")
		var that = $(this)
		$.confirm('确定要取消订单吗？', function () {
			
			var postdata = { 'interId': 'toc.closeOrder', 'channel': 'C', 'orderId': orderId,'custId':custId};
			xhq.__runXHQ(postdata, function (data) {
				if (data.status == 0) {
					 if(orderStatus==''){
						 xhq.gotoUrl('../html/order_list.html');
					 }
					 that.parents(".content-block-1").remove()
				}else{
					$.toast(data.message);
				}
			})
		})
		
	})

	// 付款
	$("#tabContent").on("click", ".pay", function () {
		var orderId = $(this).parents(".content-block-1").attr("orderId")
    	
    	var custId = getLocalSession("custId")||""
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
	// 确认签收
	$("#tabContent").on("click", ".order-signin--1", function () {
		var orderId = $(this).parents(".content-block-1").attr("orderId")
		var custId = getLocalSession("custId")||""
		var that = $(this)
		$.confirm('您确定要签收吗?', function () {
	        var postdata = { 'interId': 'toc.sureOrder', 'channel': 'C', 'orderId': orderId,'custId':custId};
				xhq.__runXHQ(postdata, function (data) {
					if (data.status == 0) {
						if(orderStatus==''){
							 xhq.gotoUrl('../html/order_list.html');
						}
						that.parents(".content-block-1").remove()
						var html = $("#tabContent").html()
						if(html.length==0){
							$("#tabContent").html(nullHtml(html))
						}
					}else{
						$.toast(data.message);
					}
			})
		})
		
	})
	
	// 追踪物流 == 跳转详情页
	$("#tabContent").on("click", ".order-signin--2", function () {
		var orderId = $(this).parents(".content-block-1").attr("orderId")
		var orderStatus = $(this).parents(".content-block-1").attr("orderStatus")
		var cancelStatus = $(this).parents(".content-block-1").attr("cancelStatus")
		
		var url = "order_detail.html"
		if(orderStatus=='1' && cancelStatus=='1'){
			url = "order_wait_pay.html"
		}else if(orderStatus=='2' && cancelStatus=='1'){
			url = "order_wait_deliver.html"
		}else if(orderStatus=='4' && cancelStatus=='1'){
			url = "order_deliver.html"
		}else if(orderStatus=='5' && cancelStatus=='1'){
			url = "order_finish.html"
		}else if(orderStatus=='6' && cancelStatus=='1'){
		    url = "order_close.html"
		}else{
			url = "order_refund.html"
		}
		xhq.gotoUrl(url,{orderId:orderId})
	})

	//   跳转详情页
	//   跳转详情页
	$("#tabContent").on("click", ".list-block", function () {
		
		$(this).children('ul').css('background','rgb(217,217,217)')

		var orderId = $(this).parents(".content-block-1").attr("orderId")
		var orderStatus = $(this).parents(".content-block-1").attr("orderStatus")
		var cancelStatus = $(this).parents(".content-block-1").attr("cancelStatus")
		var orderType=$(this).parents(".content-block-1").attr("orderType")
		var sourceType=$(this).parents(".content-block-1").attr("sourceType")
		
		var url = "order_detail.html"
		if(orderStatus=='1' && cancelStatus=='1'){
			url = "order_wait_pay.html"
		}else if(orderStatus=='2' && cancelStatus=='1' && orderType=='1'){
			url = "order_wait_deliver.html"
		}else if(orderStatus=='2' && cancelStatus=='1' && orderType=='0'){
			url = "order_wait_group.html"
		}else if(orderStatus=='4' && cancelStatus=='1'){
			url = "order_deliver.html"
		}else if (orderStatus == '5' && cancelStatus == '1' && orderType =='0') {
			//自提待成团
			url = "order_wait_group.html"
		}else if(orderStatus=='5' && cancelStatus=='1' && sourceType!=5 && orderType =='1'){
			url = "order_finish.html"
		}else if(orderStatus=='5' && cancelStatus=='1' && sourceType==5 && orderType =='1'){
			url = "order_verify.html"
		}else if(orderStatus=='6'){
		    url = "order_close.html"
		}else if(cancelStatus == '3'){
			url = "order_refund.html"
		}
		
		xhq.gotoUrl(url,{orderId:orderId,cancelStatus:cancelStatus})

	})
	
	
	function close(){
		var orderId = $("input").attr("orderId")
		$.confirm('确定要取消订单吗？', function () {
			
			var postdata = { 'interId': 'toc.closeOrder', 'channel': 'C', 'orderId': orderId,'custId':custId};
			xhq.__runXHQ(postdata, function (data) {
				if (data.status == 0) {
					xhq.gotoUrl(order_close.html,{orderId:orderId})
				}else{
					$.toast(data.message);
				}
			})
		})
	}

})
	
