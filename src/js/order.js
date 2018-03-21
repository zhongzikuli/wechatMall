var avoidExpressFee = 0;//免邮费
var expressFee = 0;//邮费
var deliverSureDay = 7;//延迟天数
var deductionPrice = 0;//可抵扣金额
var originalPrice = 0;//商品合计

var userType;//用户类型
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

// 1页面加载逻辑
// 1.1加载购物车缓存
$(document).ready(function () {
	
	var referer = document.referrer;
	if (referer && (referer.indexOf("goods_") > 0 || referer.indexOf("shopping")>0)){
		setLocalSession("sourceId","");
		setLocalSession("groupId","");
		setLocalSession("sourceType","");
		setLocalSession("channelType","");
		setLocalSession("mallType","");
	}

	var sourceId =  xhq.getQuery("sourceId");//来源id
	var sourceType =  xhq.getQuery("sourceType");//下单来源 1活动 2分享 3平台下单 4参团
	var channelType = xhq.getQuery("channelType");//订单渠道类型 1通用上架  2一元置换 3积分兑换 4参团
	var groupId = xhq.getQuery("groupId") || "";//参团id
	var mallType = xhq.getQuery("mallType") || "";//区分购物车 还是商品详情过来的
	
	if (channelType == null || channelType == "" || channelType == undefined){
		// 代表url中未带入 从缓存中读取
		channelType = getLocalSession("channelType");
		// 如果缓存中也没有值，则进行系统默认
		if (channelType == null || channelType == "" || channelType == undefined){
			channelType = 1;
			sourceType = 3;
			setLocalSession("sourceId","");
			setLocalSession("groupId","");
			setLocalSession("sourceType",sourceType);
			setLocalSession("channelType",channelType);
			setLocalSession("mallType",mallType);
		}else{
			// 不做任务处理，表示此时缓存值有效
		}
	}else{
		if (! sourceId)
			sourceId="";
		if (! sourceType)
			sourceType = "3";
		if (! channelType)
			channelType = "1";
		if (! groupId)
			groupId = "";
		setLocalSession("sourceId",sourceId);
		setLocalSession("sourceType",sourceType);
		setLocalSession("channelType",channelType);
		setLocalSession("groupId",groupId);
		setLocalSession("mallType",mallType);
	}
	
	//alert(getLocalSession("channelType"))
	
	// 校验openid
	var openId = getLocalSession("openid") || "";
	// 校验openid
	var custId = getLocalSession("custId") || "";
	//用户类型
    userType = getLocalSession("userType") || "";//1游客 2会员
	
	
	if (openId == "" || custId==""){
		$.toast("未获取到用户信息，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	
	openIndicator();
	//加载标题
	var param = { interId: 'toc.getAvoidExpressFee', channel: 'C' };
	xhq.__runXHQ(param, function (data) {
		if (data.status == 0) {
			avoidExpressFee = data.body.avoidExpressFee
			expressFee = data.body.expressFee;
			deliverSureDay = data.body.cancelDelday
			if(avoidExpressFee==0){
				$("#adtOrderTitle").html(deliverSureDay + "天无忧退货  全场包邮");
			}
			//加载地址
			loadAddress()
			//加载订单
		    loadOrder()
		    //加载 抵扣金额
		    loadDeduction()
			hideIndicator();
			bindEvent();
		} else {
			$.toast(data.message);
		}
	})
	
})

function loadDeduction(){
	//alert(userType);
	var channelType = getLocalSession("channelType");
	var custId = getLocalSession("custId") || "";
	if(userType==2 && channelType!=3){
		var param = { interId: 'toc.getIntegralCash', channel: 'C', custId:custId};
		xhq.__runXHQ(param, function (data) {
			if (data.status == 0) {
				deductionCash = data.body.deductionCash;
				if(deductionCash==0){
					$("#deductionCashCheckBox").attr("disabled",'disabled')
				}else{
					if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
						if(originalPrice>deductionCash){
							$("#deductionCashId").attr("deductionCash",deductionCash);
							$("#deductionCashId").text("¥"+deductionCash/100);
						}else{
							$("#deductionCashId").attr("deductionCash",originalPrice);
							$("#deductionCashId").text("¥"+originalPrice/100);
						}
					} else {
						if((originalPrice+expressFee)>deductionCash){
							$("#deductionCashId").attr("deductionCash",deductionCash);
							$("#deductionCashId").text("¥"+deductionCash/100);
						}else{
							$("#deductionCashId").attr("deductionCash",originalPrice);
							$("#deductionCashId").text("¥"+originalPrice/100);
						}
					}
					$(".list3").show();
				}
				
			} else {
				deductionPrice = 0;
				if(deductionCash==0){
					$("#deductionCashCheckBox").attr("disabled",'disabled')
				}
				$.toast(data.message);
			}
		})

	}
}
//是否抵扣
function deductionCashChange() {
	if($("#deductionCashCheckBox").attr('checked')==true){
		$("#deductionCashCheckBox").val('1');//抵扣
		$("#realPay").text(function () {
			if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
				if(originalPrice>deductionCash){
					return ((originalPrice-deductionCash)/100).toString()
				}else{
					return 0;
				}
			} else {
				if((originalPrice+expressFee)>deductionCash){
					return ((originalPrice+expressFee-deductionCash)/100).toString()
				}else{
					return 0;
				}
			}
		})
	}
	if($("#deductionCashCheckBox").attr('checked')==false){
		$("#deductionCashCheckBox").val('0');//不抵扣
		$("#realPay").text(function () {
			if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
				return ((originalPrice)/100).toString()
			} else {
				return ((originalPrice+expressFee)/100).toString()
			}
		})
	}
}

function loadOrder(){
	var channelType = getLocalSession("channelType")
	var data = getLocalSession("localOrderSession")
	console.log("localOrderSession"+JSON.stringify(data))
	//alert()
	if(data==null||data==''||data==undefined){
		if (xhq.getQuery("fromUserType") == 2)
			xhq.gotoUrl("home.html?version="+xhq.getVersion());
		else{
			if (xhq.getQuery("isWs") == 1){
				xhq.gotoUrl("ws_home.html?version="+xhq.getVersion());
			}else{
				xhq.gotoUrl("home.html?version="+xhq.getVersion());
			}
		}
		return;
	}else{
		var mailList = $("#mailList").html()
		var body = JSON.parse(data)
		if (body.length > 0) {
			for (var i = 0; i < body.length; i++) {
				var obj = body[i];
				mailList += '<div class="list1"><hr>';
				mailList += '<div class="list1-img"><img src="' + obj.bigPic + '" alt=""></div>';
				mailList += '<div class="list1-wenzi">';
				mailList += '<p>' + obj.showName + '</p>';
				if(channelType==3){
					 mailList += '<span class="price" salePrice=' + obj.salePrice + '></span>';
				}else{
				  mailList += '<span class="bargain-price price" salePrice=' + obj.salePrice + '>' + obj.salePrice / 100 + '</span>';
				}
				mailList += '<span class="youfei" style="display:none;" mailMoney=' + obj.mailMoney + '>' + obj.mailMoney + '</span><span num=' + obj.num + ' class="img">' + obj.num + '</span>';
				mailList += '<p class="norms1"></p>';
				mailList += '</div>';
				mailList += '</div>';
			}
			$("#mailList").html(mailList);
		}
	}
}

function loadAddress(){
	//setLocalSession("localAddressSession","");
	//获取默认地址
	var localAddressSession = getLocalSession("localAddressSession");
	var addressHtml=$(".content-block2").html();
	//地址信息
	if(localAddressSession==null || localAddressSession ==undefined || localAddressSession==''){
		queryDefaultAddressOrSetLocalAddress();
	}else{
		setAddressInfo(localAddressSession)
	}
}

function setAddressInfo(addressSession){
	var data = JSON.parse(addressSession);
	if(data.length==0){
		$(".content-block2").html(nullAddressHtml(addressHtml))
	}else{
		var province = data.province || '';
		var city = data.city || '';
		var country = data.country || '';
		var addressDetail = province + data.city+country;
		addressDetail= addressDetail + data.address;
		var addressName = data.addressName;
		var addressPhoneNo = data.phoneNo;
 	    var phoneNoStr = addressPhoneNo.replace(addressPhoneNo.substr(3,7),"****");
 	  
		var addressId = data.addressId;
		
	    var addressHtml='<div addressId = "'+addressId+'">';
	    addressHtml+='<span id="addressName">'+addressName+'</span> <span class="phone" id="addressPhoneNo">'+phoneNoStr+'</span>';
	    addressHtml+='<p><span id="moren">默认</span> <span class="attr phone" id="addressDetail">'+addressDetail+'</span></p>'
	    addressHtml+='</div>';
	    addressHtml+='<div> <img class="img" src="../img/icoJiantou@2x.png" alt=""></div>';
	    $(".content-block2").append(addressHtml)
	}
}

function queryDefaultAddressOrSetLocalAddress(){
	
	var custId = getLocalSession("custId") || "";
	var param = {};
	param.interId = 'toc.getCustDefaultAddress';
	param.channel = "C";
	param.custId = custId;
	xhq.__runXHQ(param, function (data) {
		if(data.status=='0'){
			if(data.body){
				 var obj = {
		                    addressId: data.body.id,
		                    addressName: data.body.name,
		                    phoneNo: data.body.phoneNo,
		                    province: data.body.province,
		                    city: data.body.city,
		                    country: data.body.country,
		                    address: data.body.address,
		                    defaultFlag: data.body.defaultFlag
		                }
		         setLocalSession("localAddressSession", JSON.stringify(obj))
		         setAddressInfo(JSON.stringify(obj));
			}else{
				 $(".content-block2").append(nullAddressHtml())
			}
		}else{
			$.alert(data.message);
		}
	})
	
}

function nullAddressHtml(){
	    var addressHtml='<div style="position:absolute;top:34pt;font-size:0.85rem;width:90vw;">';
	    addressHtml+='<img style="width:16pt;height:16pt;vertical-align:middle;position: relative;top: -1pt;" src="../img/oval@2x.png" alt="">'
	    addressHtml+='<span style="padding-left:5pt;color:rgb(0,0,0)">你还未添加收货地址</span> <span style="position:absolute;top:0pt;right:20pt;color:rgb(222, 63, 55)">去添加</span>'
	    addressHtml+='</div> <div> <img class="img" src="../img/icoJiantou@2x.png" alt=""></div>'
	  return addressHtml;
}

function bindEvent() {
	
	$("#goback").click(function(){
		window.history.go(-1)
	})
	// 点击修改地址，需要修改
	$(".content-block2").click(function () {
		var addressSession = getLocalSession("localAddressSession");
		if(addressSession==null || addressSession ==undefined || addressSession==''){
			xhq.gotoUrl("address_register.html",{type:2,pageType:1});
		}else{
			xhq.gotoUrl("address_list.html",{pageType:1});
		}	
	})
	
	var totalMailMoney = 0;
	$(".list1").each(function () {
		var salePrice = $(this).find(".list1-wenzi  .price").attr("salePrice")
		var num = $(this).find(".list1-wenzi  .img").attr("num")
		originalPrice += salePrice * num;
	})
	
	var channelType = getLocalSession("channelType")
	if(channelType==3){
		$("#originalPrice").removeClass("bargain-price")
		$("#fukuanId").text("实付积分:")
		$("#realPay").removeClass("fukuan price")
		$("#paymentContent").text("确认兑换")
	}

	$("#originalPrice").text(function () {
		if(channelType==3){
			return (parseFloat(originalPrice)).toString()
		}else{
		    return (parseFloat(originalPrice)/100).toString()
		}
	});
	
	$("#avoidExpressFee1").text(function(){
		
		return (parseFloat(avoidExpressFee)/100).toString()
	}
    );
    
	$("#expressFee1").text(function () {
		if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
			return (0).toString()
		} else {
			return (parseFloat(expressFee)/100).toString()
		}
	});

	//实付
	$("#realPay").text(function () {
		if(channelType==3){
			if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
				return (parseFloat(originalPrice)).toString()
			} else {
				return ((originalPrice + parseFloat(expressFee))).toString()
			}
		}else{
			if (parseFloat(originalPrice) >= parseFloat(avoidExpressFee)) {
				return (parseFloat(originalPrice)/100).toString()
			} else {
				return ((originalPrice + parseFloat(expressFee))/100).toString()
			}
		}
		
	});
	// 关闭广告
	$(".content-block .content-block1 img").click(function () {
		$(".content-block1").hide()
	});

	// 去付款
	$(".xia").click(function () {
		var sourceId = getLocalSession("sourceId") ||"" //来源id
		var fromCustId = xhq.getQuery("fromCustId")||""
		if(sourceId=="" || sourceId==0){
			sourceId = fromCustId;
		}
		$(this).addClass('none');  //点击下单 按钮变灰且不可点击
		openIndicator();
		var openId = getLocalSession("openid") || "";// 校验openid
		var custId = getLocalSession("custId") || "";// 校验custId
		
		var addressId = $(".content-block2").find("div").eq(0).attr("addressId")||'';
		var sourceType = getLocalSession("sourceType")||"" //下单来源 1活动 2分享 3平台下单 4参团 5核销订单
		var channelType = getLocalSession("channelType")||"" //订单渠道类型 1通用上架  2一元置换 3积分兑换 4参团 5开团
		var groupId =  getLocalSession("groupId")||"" //参团id
		
		if (openId == "" || custId==""){
			hideIndicator();
			$.toast("未获取到用户信息，无法访问");
			xhq.gotoErrorPage();
			return;
		}
		if(channelType==""){
			hideIndicator();
			$(this).removeClass('none');
			$.toast("订单渠道类型不能为空，无法访问");
			return;
		}
		if(channelType=='4' && groupId==""){
			hideIndicator();
			$(this).removeClass('none');
			$.toast("参团信息不能为空");
			return;
		}

		if(addressId=='' || addressId==undefined || addressId==null){
			hideIndicator();
			$(this).removeClass('none');
			$.toast("用户地址信息不能为空");
			return;
		}
		
		var orderDetails = JSON.parse(getLocalSession("localOrderSession"));
		var obj = {};
		obj.interId = 'toc.createOrder';
		obj.channel = "C";
		obj.custId = custId;
		obj.addressId = addressId;
		obj.remark = $("#remark").val();
		obj.expressFee = parseFloat($("#expressFee1").text()*100).toFixed(0)
		obj.totalNum = "" //商品总数量
		if(channelType==3){//积分兑换
			obj.realPay = parseFloat($("#realPay").text()).toFixed(0)
		}else{
			obj.realPay = parseFloat($("#realPay").text()*100).toFixed(0)
		}
		if($("#deductionCashCheckBox").val()==1){//抵扣
			obj.deductionStatus = 1;
			obj.deductionPrice = $("#deductionCashId").attr("deductionCash");
		}else{//不抵扣
			obj.deductionStatus = 0;
			obj.deductionPrice = 0;
		}
		obj.shippingModel = $("input[name='shippingModel']:checked").val();////1. 自提 2.寄送 3.上门自提,目前默认为2
		obj.details = orderDetails;
		obj.sourceId =  sourceId;//来源id
		obj.sourceType =  sourceType;//下单来源 1活动 2分享 3平台下单 4参团
		obj.channelType = channelType;//订单渠道类型 1通用上架  2一元置换 3积分兑换 4参团
		obj.groupId = groupId;//参团id
		var that = $(this);
		var param = obj;
		
		xhq.__runXHQ(param, function (data) {
			if(data.status==0){
				
				//需要把购物车里面购买的商品清空
				var mallType = getLocalSession("mallType")||"";
				
				var orderNo = data.body.orderNo;
				var groupId = data.body.groupId || "";
				var channelType = data.body.channelType;
				var deductionStatus = data.body.deductionStatus||"";
				var payMoney = data.body.payMoney||"";
				if(deductionStatus=='1' && payMoney=='0'){
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
					xhq.gotoUrl('../html/paysuccess.html',{orderNo:orderNo,channelType:channelType,groupId:groupId});
				}else if(channelType!=3){
					var payConfig = {};
					payConfig['appId'] = data.body.weiData.appId;
					payConfig['nonceStr'] = data.body.weiData.nonceStr.toString();
					payConfig['package'] = data.body.weiData.packageInfo;
					payConfig['paySign'] = data.body.weiData.paySign;
					payConfig['timeStamp'] = data.body.weiData.timeStamp+'';
					
					xhq.wxPay(payConfig, function (res) {
						hideIndicator();
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
						
						if(channelType=='4'){
							xhq.gotoUrl('../html/tour_successful.html',{orderNo:orderNo,channelType:channelType,groupId:groupId});
						}else{
							xhq.gotoUrl('../html/paysuccess.html',{orderNo:orderNo,channelType:channelType,groupId:groupId});
						}
					},function(){
						hideIndicator();
						$.toast("支付失败");
						xhq.gotoUrl('../html/order_list.html');
					});
				}else{
					//积分兑换
					xhq.gotoUrl('../html/paysuccess.html',{orderNo:orderNo,channelType:channelType});
				}
				
			}else{
				hideIndicator();
				$.alert(data.message);
				that.removeClass('none');
			}
		});
	})
	
	//删除下单的购物车商品信息
//	function deleteShoppingCartLocalSession(orderDetails) {
//		
//		var cartSS = getLocalSession("shoppingCartLocalSession");
//		if(orderDetails!=null && orderDetails !='' && cartSS!=null && cartSS!='' && cartSS!=undefined){
//			var cartSession = JSON.parse(getLocalSession("shoppingCartLocalSession"));
//			for(var j=0;j<orderDetails.length;j++){
//					var onlineId = orderDetails[j].onlineId
//					for (var i = 0; i < cartSession.body.length; i++) {
//						if (cartSession.body[i].onlineId == onlineId) {
//								cartSession.body.splice(i, 1);
//								if (cartSession.body.length == 0) {
//									cartSession = "";
//								}
//								break;
//						}
//					}
//			}
//			setLocalSession("shoppingCartLocalSession", JSON.stringify(cartSession));
//		}
//	}
}
