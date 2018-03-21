var openId;
var custId;
var oldOnlineId;  // 当前页面展示的onlineId
var channel;
var footMode; // 当前底部栏模式：1显示的是addCart  2显示的是addCart2
var countConduct; // 中央文案是否已加载过
var cartJson;
var orderJson;
var globalNeedVerify = 0;
var topTypeName = '';
var globalStatus = 1;
var gwc=1;//默认为 购买

$(function () {
	openId = getLocalSession("openid") || "";
	custId = getLocalSession("custId") || "";
	
	// 页面加载之初检测，如果用户资料未获取到，则不允许访问
	if (openId == "" || custId == "") {
		xhq.gotoErrorPage();
		return;
	}
	
	// 取得传入参数onlineId
	var onlineId = xhq.getQuery("onlineId"); 
	
	// 根据onlineId加载商品信息
	getDetail(onlineId);
	
	// 加载购物车状态
	loadCartNum();
	
	// 加载点击绑定
	$('#goods_detail_tab').on('tap',function(){
		showFoot();
	});
	
	$('#goods_document_tab').on('tap',function(){
		hideFoot();
		getConduct(oldOnlineId);
	});
	
	// 商品数量增加
	$(".add").on('tap',function(){
		if($(this).attr('disabled')) return;
		var input_num = $('.num_handle');
		input_num.val(parseInt(input_num.val())+1);
	});
	// 商品数量减少
	$(".subtract").on('tap',function() {
		if($(this).attr('disabled')) return;
		var input_num = $('.num_handle');
		input_num.val(parseInt(input_num.val()) - 1);
		if (parseInt(input_num.val()) < 1) {
			input_num.val(1);
		}
	});

	// 点击加入到购物车数量增加
	$('.add_cart').on('tap',function(){
		if($(this).attr('disabled')) return;
		
		var custNumber = getLocalSession("custNumber")||"";
		
		//alert("custNumber:"+custNumber+"status:"+$('#status').val() );
		if((custNumber == null || custNumber == undefined || custNumber=='') && topTypeName=='网咖' && globalStatus == 1){
			//绑定身份证号码
			$('.bind_id').css('display','block');
	        $('.cover').css('display','block');
	        gwc = 2;
	        return;
		}
		addToCart();
	});
	
	// 点击购买
	$('.buy_now').on('tap',function(){
		gwc = 1;
		//alert("buy_now:gwc:"+gwc);
		if($(this).attr('disabled')) return;
		orderJson.num = $('.num_handle').val()
		refreshOrderCache(orderJson);
		var phoneNo = getLocalSession("phoneNo");
		var custNumber = getLocalSession("custNumber");
		
		var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
		if ((phoneNo == null || phoneNo == undefined || !regexp.test(phoneNo.trim())) && globalNeedVerify && globalStatus == 1){
			$('.bind_phone').css('display','block');
	        $('.cover').css('display','block');
		}else if((custNumber == null || custNumber == undefined || custNumber=='') && topTypeName=='网咖' && globalStatus == 1){
			//绑定身份证号码
			$('.bind_id').css('display','block');
	        $('.cover').css('display','block');
		}else{
			gotoBuyPub(channel);
		}
	});
	
	$(".bind_cancle").on('tap',function() {
		if(topTypeName=='网咖'){
			$('.bind_id').css('display','none');
	        $('.cover').css('display','none');
		}else{
			$('.bind_phone').css('display','none');
	        $('.cover').css('display','none');
		}
	});
    
    $(".bind_comfir").on('tap', function(){
    	 if(topTypeName=='网咖'){
    		 bindCustNumber();
    	 }else{
    		 bindPhone();
    	 }
    });
	
    $('#btnGetCode').on('tap',function(e){
		var mobile = $.trim($('#newPhoneNo').val());
		xhq.tobGetVerificationCode($(this), mobile, function(){
			$.toast('验证码已发送');
		});
    });
	
	$(".cart").on('tap',function() {
		if($(this).attr('disabled')) return;
		xhq.gotoUrl("shoppingcart.html",{});
	});

	// 复制文案
	$(".copy_document").on('tap',function () {
		$(".document_span").addClass('active')
	})

	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);
		wx.onMenuShareTimeline(shareConfig);
	});
	
	$("#tohome1").on('tap',function() {
		if (xhq.getQuery("fromUserType") == 2){
			xhq.gotoUrl("home.html");
		}else{
			if (xhq.getQuery("isWs") == 1){
				xhq.gotoUrl("ws_home.html");
			}else{
				xhq.gotoUrl("home.html");
			}
		}
	});
	$("#tohome2").on('tap',function() {
		if (xhq.getQuery("fromUserType") == 2){
			xhq.gotoUrl("home.html");
		}else{
			if (xhq.getQuery("isWs") == 1){
				xhq.gotoUrl("ws_home.html");
			}else{
				xhq.gotoUrl("home.html");
			}
		}
	});
})

//绑定身份证号码
function bindCustNumber(){
	
	//alert("gwc:"+gwc)
	var custNumber = $.trim($('#newCustNumber').val());
	if (custNumber == null || custNumber == ""){
		$.toast("身份证号码未录入");
		return;	
	}
	if (custNumber.length != 18){
		$.toast("身份证号码长度不正确，请检查");
		return;	
	}

	// 调用ajax
	$.showIndicator();
	var param={interId:'toc.updateCustNumberInfo',channel:'C',custId:custId,custNumber:custNumber};
	xhq.__runXHQ(param, function(data){
		$.hideIndicator();
		if (data.status == 0){ // 只要正常返回body里肯定有值
			setLocalSession("custNumber",custNumber);
			if(gwc==2){
				addToCart();
				$('.bind_id').css('display','none');
		        $('.cover').css('display','none');
			}else{
				gotoBuyPub(channel);
			}
		}else{
			$.toast(data.message);
		}	
	});
}

function bindPhone(){
	
	var mobile = $.trim($('#newPhoneNo').val());
	var code = $.trim($('#verficode').val());
	if (mobile == null || mobile == ""){
		$.toast("手机号码未录入");
		return;	
	}
	if (mobile.length != 11){
		$.toast("手机号码长度不正确，请检查");
		return;	
	}
	if (code == null || code == ""){
		$.toast("验证码未录入");
		return;	
	}
	if (code.length != 4){
		$.toast("验证码长度为4位，请检查");
		return;	
	}

	// 调用ajax
	$.showIndicator();
	var param={interId:'toc.updateCustInfo',channel:'C',custId:custId,phoneNo:mobile,verificationCode:code};
	xhq.__runXHQ(param, function(data){
		$.hideIndicator();
		if (data.status == 0){ // 只要正常返回body里肯定有值
			setLocalSession("phoneNo",mobile);
			gotoBuyPub(channel);
		}else{
			$.toast(data.message);
		}	
	});
}
function loadCartNum(){
	var shopcart = getLocalSession('shoppingCartLocalSession');
	if (shopcart && shopcart.search('{') != -1){
		var cart = JSON.parse(shopcart);
		if (cart.body != null){
			$(".cart .badge").html(cart.body.length || 0);
		}
	}
}

function getDetail(onlineId){
	if (oldOnlineId == onlineId)
		return;
	oldOnlineId = onlineId;
	countConduct = 0;
	
	$.showIndicator();
	var param={'interId':'toc.getOnlineDetail','channel':'C','onlineId':onlineId,isWs:xhq.getQuery("isWs")};
	xhq.__runXHQ(param, function(data){
		$.hideIndicator();
		if (data.status == 0){
			// 加载数据
			setData(data.body);

			// 微信分享设置
			var fromStr = getLocalSession("userType") == 2 ? "&fromCustId="+custId+"&fromUserType=2" : ''; //1:游客，2:会员
			shareTitle = data.body.showName||"全民集市精品分享";
			shareIcon=data.body.bigPic;
			shareUrl=xhq.getDomainUrl()+"share_goods_detail.html?onlineId="+onlineId+fromStr+"&"+xhq.getVersion();
			shareConfig={
				title: shareTitle,
				desc: "我在全民集市发现了一个不错的商品，快来看看吧。",
				link: shareUrl,
				imgUrl: shareIcon
			};

			xhq.initWXJsConfig();
		}else{
			$.toast(data.message);
		}
	});
}

function setData(body){
	var needVerify = body.needVerify || 0;
	globalNeedVerify = needVerify;
	
	topTypeName = body.topTypeName;
	
	globalStatus = body.status;

	channel = body.channel;
	description = editHTML(body.description);
	$('.text_goods').html(description);
	specDescription = editHTML(body.specDescription);
	$('.parameter').html(specDescription);
	maintainDesction = editHTML(body.maintainDesction);
	$('.to_know').html(maintainDesction);
	// 图片懒加载
	$('.test-lazyload').picLazyLoad({ threshold: 100});
	
	// 处理规格的显示
	var propertys = body.ggs;
	if (propertys && propertys.length){
		var spec_itemHtml = ''
		for(var j in propertys){
			var clsSpec = (oldOnlineId == propertys[j]['online_id'] ? 'spec_list active' : "spec_list");
			spec_itemHtml += '<span class="'+clsSpec+'" id='+propertys[j]['online_id']+'>'+propertys[j]['ggValue']+'</span> ';
		}
		$('.spec_item').html(spec_itemHtml);
	}
	
	$('.spec_item').on('tap','.spec_list',function(){
		if ($(this).attr('id') == oldOnlineId)
			return;
		$("#"+oldOnlineId).removeClass("active");
		$(this).addClass('active');
		getDetail($(this).attr('id'));
	})

	// 加载轮播图
	if (body.images && body.images != ""){
		var arrImages = body.images.split(',');
		if (arrImages.length){
			var swiperHtml = '<div class="swiper-wrapper">';
			for(var j in arrImages){
				swiperHtml += '<div class="swiper-slide"><img src="'+arrImages[j].trim()+'" alt=""></div>';
			}
			swiperHtml += '</div>'+
			'<div class="swiper-pagination"></div>';
			$('.swiper-container').html(swiperHtml);
			
			// 配置轮播图
			if (arrImages.length>1){
				var swiper = new Swiper('.swiper-container', {
					pagination: '.swiper-pagination',
					paginationClickable: true,
					spaceBetween: 30,
					centeredSlides: true,
					autoplay: 2500,
					autoplayDisableOnInteraction: false
				});
			}
		}
	}

	// 设置商品名称，价格，赠送积分等的显示
	setGoodsBrief(body);
	
	// 设置foot区的显示
	setFoot(body);
	
	// 初始化cartJson对象
	initCartJson(body);
	initOrderJson(body);
}

function initCartJson(object){
	cartJson = {
		showName:object.showName,
		money: object.money,
		salePrice: object.salePrice,
		onlineId: object.onlineId,
		bigPic: object.bigPic,
		goodId: object.skuId,
		mailMoney: object.mailMoney,
		purchasePrice: object.purchasePrice,
		num: 0	
	}
}

function initOrderJson(object){
	orderJson = {
		showName:object.showName,
		mailMoney: object.mailMoney,
		salePrice: object.salePrice,
		onlineId: object.onlineId,
		bigPic: object.bigPic,
		goodId: object.skuId,
		purchasePrice: object.purchasePrice,
		num: 0	
	}
}

function setGoodsBrief(body){
	var purchasePrice = ((body.purchasePrice || 0)/100);
	var txtPurchasePrice = parseInt(purchasePrice) == 0 || purchasePrice == '' ? '' : '<span class="price_two">&yen;'+purchasePrice+'</span>';
	var txtEndTime = (body.endTime||"") == '' ? '' : '<span class="end_time"><span>'+body.endTime+'</span>结束</span>';
	var txtStartTime = (body.startTime||"") == '' ? '' : '<span class="end_time"><span>'+body.startTime+'</span>开始抢购<span>';
	if (xhq.getQuery("isWs") == 1){
		$("#brief1").css("display","none");
		$("#brief2").css("display","block");
		
		var briefHtml = '<div class="brief_title">'+body.showName+'</div>';
		briefHtml += '<div class="brief_price">'+
					'<p class="p_l">' +
						'<span class="price_one">特卖价</span>' +
						'<span class="span_m">&yen;'+((body.salePrice || 0)/100)+'</span class="price_two">'+txtPurchasePrice+'<br>'+
						'<span class="price_three">赚：<span class="bonus">&yen;'+((body.bonus || 0)/100)+'</span></span>'+
					'</p>' +
					'<p class="p_r"><span>'+(body.salesNum || 0)+'</span>人在卖<br>'+txtEndTime+txtStartTime+'</p></div>';
		$('#brief2').html(briefHtml);
	}else{
		$("#brief1").css("display","block");
		$("#brief2").css("display","none");
		var briefHtml = '<div class="brief_title">'+body.showName+'</div>';
		briefHtml += '<div class="brief_price">'+
					'<p class="p_l">' +
						'<span class="price_one">特卖价</span>' +
						'<span class="span_m">&yen;'+((body.salePrice || 0)/100)+'</span class="price_two">'+txtPurchasePrice+'<br>'+
						'<span class="price_three">送积分：<span class="bonus">'+((body.money || 0))+'</span></span>'+
					'</p>' +
					'<p class="p_r"><span>'+(body.salesNum || 0)+'</span>人在卖<br>'+txtEndTime+txtStartTime+'</p></div>';
		$('#brief1').html(briefHtml);
	}
	
	if (body.status == 1){
		$('.goods_state').children('img').attr('src','../img/jinxingzhong.png');
	}else if (body.status == 2){
		$('.goods_state').children('img').attr('src','../img/yishouwan.png');
	}else if (body.status == 3){
		$('.goods_state').children('img').attr('src','../img/weikaishi.png');
	}else if (body.status == 4){
		$('.goods_state').children('img').attr('src','../img/yijieshu.png');
	}
}

function hideFoot(){
	if (footMode == 1){
		$("#addCart").hide();
	}else{
		$("#addCart2").hide();
	}
}

function showFoot(){
	if (footMode == 1){
		$("#addCart").show();
	}else{
		$("#addCart2").show();
	}
}

// mode == 1代表有购物车功能  mode==2无购物车功能
function setFootDisable(mode){
	$('.subtract').attr("disabled",'disabled');
	$('.add').attr("disabled",'disabled');
	if (mode == 1){
		$('.cart').attr("disabled",'disabled');
		$('.add_cart').attr("disabled",'disabled');
		$('.badge').css('background','rgb(156,156,156)');
		$('.add_cart').css('background','rgb(180,180,180)');
	}
	$('.buy_now').attr("disabled",'disabled');
	$('.buy_now').css('background','rgb(156,156,156)');
}

//mode == 1代表有购物车功能  mode==2无购物车功能且数量不能增加和减少
function setFootAble(mode){
	if (mode == 2){
		$('.subtract').attr("disabled",'disabled');
		$('.add').attr("disabled",'disabled');
	}else{
		$('.subtract').attr("disabled",null);
		$('.add').attr("disabled",null);
		
		$('.cart').attr("disabled",null);
		$('.add_cart').attr("disabled", null);
		
		$('.badge').css('background','rgb(222,63,55)');
		$('.add_cart').css('background','rgb(249,174,57)');
	}

	$('.buy_now').attr("disabled",null);
	$('.buy_now').css('background','rgb(222,63,55)');
}

function setFoot(body){
	if (body.channel == 2 || (body.channel == 1 && body.needVerify)){
		footMode = 2;
		$("#addCart2").show();
		$("#addCart").hide();
		if (body.status == 1){
			setFootAble(2);
		}else{
			setFootDisable(2);
		}
	}else{
		footMode = 1;
		$("#addCart").show();
		$("#addCart2").hide();
		if (body.status == 1){
			setFootAble(1);
		}else{
			setFootDisable(1);
		}
	}
}

// 加载中央文案：如果已加载则不再重复加载
function getConduct(onlineId){
	if (! countConduct){
		$.showIndicator();
		var param={interId:'toc.getOnlineConduct',channel:'C',onlineId:onlineId};
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				countConduct++;
				addConductElement(data.body)
			}else{
				$.toast(data.message);
			}
		});
	}
}

function addConductElement(body){
	if (body && body.length>0){
		// 素材图
		if (body[0].images){
			var document_picHtml = '';
			var arrOthImages = body[0].images.split(',');
			if (arrOthImages.length){
				for(var j in arrOthImages){
					document_picHtml += '<div class="pic_item"><img src="'+arrOthImages[j].trim()+'" alt=""></div>';
				}
			}
			$('.document_pic').html(document_picHtml);
		}
		// 文案
		$('.document_span').html(body[0].conduct);
	}
}

// 添加到购物车
function addToCart(){
	var num = $('.num_handle').val();
	num = parseInt(num);
	cartJson.num = num;
	var cartNum = addCartPub(cartJson);
	$(".cart .badge").html(cartNum || 0);
}
