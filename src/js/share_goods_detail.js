var openId;
var custId;
var oldOnlineId;  // 当前页面展示的onlineId
var fromCustId;
var channel;
var orderJson;
var shareConfig;
var globalStatus = 1;
var topTypeName='';
var globalNeedVerify;

$(function () {
	openId = getLocalSession("openid") || "";
	custId = getLocalSession("custId") || "";
	
	// 页面加载之初检测，如果用户资料未获取到，则不允许访问
	if (openId == "" || custId == "") {
		xhq.gotoErrorPage();
		return;
	}
	
	var onlineId = xhq.getQuery("onlineId");
	fromCustId = xhq.getQuery("fromCustId") || 0; 

	// 根据onlineId加载商品信息
	getDetail(onlineId,fromCustId);

	// 因为可能存在游客分享的情况，暂时不显示该部分内容
	$('.wx_box').hide();

	// 商品数量增加
    $(".add").on('tap',function(){
    	if($(this).attr('disabled')) return;
        var input_num = $('.num_handle');
        input_num.val(parseInt(input_num.val())+1)
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

    $('#buy_now').on('tap',function(){
    	if($(this).attr('disabled')) return;
    	// 判断会员状态
    	var userType = getLocalSession("userType");
    	if (channel == 2 && userType == 1){
			$.toast("这是一元换购商品，只有成为会员才能购买");
			xhq.gotoRegUrl();
			return;
    	}
    	
    	orderJson.num = $('.num_handle').val()
    	refreshOrderCache(orderJson);
    	var phoneNo = getLocalSession("phoneNo");//手机号码
    	var custNumber = getLocalSession("custNumber");//身份证号码
    	
		var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
		if ((phoneNo == null || phoneNo == undefined || !regexp.test(phoneNo.trim())) && globalNeedVerify && globalStatus == 1){
			$('.bind_phone').css('display','block');
	        $('.cover').css('display','block');
		}else if((custNumber == null || custNumber == undefined || custNumber=='') && topTypeName=='网咖' && globalStatus == 1){
			//绑定身份证号码
			$('.bind_id').css('display','block');
	        $('.cover').css('display','block');
		}else{
			gotoBuyPub(channel,fromCustId);
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

	if (xhq.getQuery("fromUserType") == 2){
		$(".toshop").show();
		$(".tohome").hide();
		
	}else{
		$(".tohome").show();
		$(".toshop").hide();
	}

	$(".tohome").on('tap',function() {
		if (getLocalSession("userType") == 2)
			xhq.gotoUrl("ws_home.html",{isWs:1});
		else
			xhq.gotoUrl("home.html")
	});

	$(".toshop").on('tap',function() {
		xhq.gotoUrl("ws_shop.html")
	})

	
    $('#btnGetCode').on('tap',function(e){
		var mobile = $.trim($('#newPhoneNo').val());
		xhq.tobGetVerificationCode($(this), mobile, function(){
			$.toast('验证码已发送');
		});

    });
    
    wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);	
		wx.onMenuShareTimeline(shareConfig);
    });
});

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
			$('.bind_id').css('display','none');
		    $('.cover').css('display','none');
			gotoBuyPub(channel,fromCustId);
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
			gotoBuyPub(channel,fromCustId);
		}else{
			$.toast(data.message);
		}	
	});
}

function getDetail(onlineId, fromCustId){
	if (oldOnlineId == onlineId)
		return;
	oldOnlineId = onlineId;
	
	$.showIndicator();
	var param={interId:'toc.getOnlineDetail',channel:'C',onlineId:onlineId,fromCustId:fromCustId};
	xhq.__runXHQ(param, function(data){
		// 检测返回值
		$.hideIndicator();
		if (data.status == 0){
			setData(data.body);
			globalStatus = data.body.status;
			globalNeedVerify = data.body.needVerify;
			//console.log(JSON.stringify(data));
			// 微信分享设置
			var fromStr = window.location.search;
			shareConfig={
				    title: data.body.showName||"全民集市精品分享", 
				    desc: "我在全民集市发现了一个不错的商品，快来看看吧。",
				    link: xhq.getDomainUrl()+"share_goods_detail.html"+fromStr+"&"+xhq.getVersion(),
				    imgUrl: (data.body.bigPic || "").trim()
				};
			xhq.initWXJsConfig();
			
		}else{
			$.toast(data.message);
		}	
	});
}

function setData(body){
	channel = body.channel;
	topTypeName = body.topTypeName;
	// 设置分享者信息
	$('.wx_text').html(body.sharerName || '');
	$('.wx_pic').html('<img src="'+(body.sharerImg || '')+'" alt="">');

	description = editHTML(body.description);
	$('.text_goods').html(description);
	specDescription = editHTML(body.specDescription);
	$('.parameter').html(specDescription);
	maintainDesction = editHTML(body.maintainDesction);
	$('.to_know').html(maintainDesction);
	$('.test-lazyload').picLazyLoad({ threshold: 100});

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
		getDetail($(this).attr('id'),fromCustId);
	})
	
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
	
	// 商品状态
	var purchasePrice = ((body.purchasePrice || 0)/100);
	var txtPurchasePrice = parseInt(purchasePrice) == 0 || purchasePrice == '' ? '' : '<span class="price_two">&yen;'+purchasePrice+'</span>';
	var txtEndTime = (body.endTime||"") == '' ? '' : '<span class="end_time"><span>'+body.endTime+'</span>结束</span>';
	var txtStartTime = (body.startTime||"") == '' ? '' : '<span class="end_time"><span>'+body.startTime+'</span>开始抢购<span>';
	briefHtml = '<div class="brief_title">'+body.showName+'</div>';
	briefHtml += '<div class="brief_price">'+
				'<p class="p_l">' +
					'<span class="price_one">特卖价</span>' +
					'<span class="span_m">&yen;'+((body.salePrice || 0)/100)+'</span>'+txtPurchasePrice+
				'</p>' +
				'<p class="p_r">'+txtEndTime+txtStartTime+
				'</p>' +
		'</div>';
	$('.goods_brief').html(briefHtml);
	if (body.status == 1){
		$('.goods_state').children('img').attr('src','../img/jinxingzhong.png');
	}else if (body.status == 2){
		$('.goods_state').children('img').attr('src','../img/yishouwan.png');
	}else if (body.status == 3){
		$('.goods_state').children('img').attr('src','../img/weikaishi.png');
	}else if (body.status == 4){
		$('.goods_state').children('img').attr('src','../img/yijieshu.png');
	}
	
	// 设置foot区的显示
	setFoot(body);
	
	// 初始化OrderJson对象
	initOrderJson(body);
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

//mode == 1代表有购物车功能  mode==2无购物车功能
function setFootDisable(mode){
	$('.subtract').attr("disabled",'disabled');
	$('.add').attr("disabled",'disabled');
	
	$('.go_change').attr("disabled",'disabled');
	$('.go_change').css('background','rgb(156,156,156)');
}

//mode == 1代表可增减数量  2不允许增减数量
function setFootAble(mode){
	if (mode == 2){
		$('.subtract').attr("disabled",'disabled');
		$('.add').attr("disabled",'disabled');
	}else{
		$('.subtract').attr("disabled",null);
		$('.add').attr("disabled",null);
	}

	$('.go_change').attr("disabled",null);
	$('.go_change').css('background','rgb(222,63,55)');
}

function setFoot(body){
	if (body.channel == 2 || (body.channel == 1 && body.needVerify)){
		if (body.status == 1){
			setFootAble(2);
		}else{
			setFootDisable(2);
		}
	}else{
		if (body.status == 1){
			setFootAble(1);
		}else{
			setFootDisable(1);
		}
	}
}
