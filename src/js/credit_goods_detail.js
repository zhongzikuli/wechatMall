/**
 * Created by holmes on 2017/2/4.
 */
 var debug = true; 
 var openId;
 var custId;
 var orderJson;
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
 	
 	// 点击加入到购物车数量增加
 	$('.go_pay').on('tap',function(){
 		if($(this).attr('disabled')) return;
 		refreshOrderCache(orderJson); //缓存订单信息
 		if (debug) console.log(getLocalSession("localOrderSession"));
 		param = {mailType:'lkgm',sourceType:3,channelType:3};
 		xhq.gotoUrl("order.html",param); //跳转到订单页
 	});
 })

 function getDetail(onlineId){
 	$.showIndicator();
 	var param={'interId':'toc.getExchangeDetail','channel':'C','onlineId':onlineId,'custId':custId};
 	xhq.__runXHQ(param, function(data){
 		$.hideIndicator();
 		if (debug) console.log(JSON.stringify(data));
 		if (data.status == 0){
 			// 加载数据
 			setData(data.body);
 			hideIndicator();
 		}else{
 			$.toast(data.message);
 			hideIndicator();
 		}
 	});
 }

 function setData(body){
 	description = editHTML(body.description);
 	$('.text_goods').html(description);
 	specDescription = editHTML(body.specDescription);
 	$('.parameter').html(specDescription);
 	maintainDesction = editHTML(body.maintainDesction);
 	$('.to_know').html(maintainDesction);
 	// 图片懒加载
 	$('.test-lazyload').picLazyLoad({ threshold: 100});
 
 	// 设置轮播图
 	setSwiper(body);

 	// 设置商品名称，价格，赠送积分等的显示
 	setGoodsBrief(body);
 	
 	// 设置foot区的显示
 	setFoot(body);
 	
 	// 初始化cartJson对象
 	initOrderJson(body);
 }

 function initOrderJson(object){
 	orderJson = {
 		showName:object.showName,
 		mailMoney: 0,
 		salePrice: object.salePrice,
 		onlineId: object.onlineId,
 		bigPic: object.bigPic,
 		goodId: object.skuId,
 		purchasePrice: 0,
 		num: 1
 	}
 }

 function setGoodsBrief(body){
 	var salePrice = body.salePrice || 0;
 	var showName = body.showName || '';
 	var briefHtml = '<div class="goods_text">'+showName+'</div>'+
        '<div class="goods_price"><span>'+salePrice+'</span>积分</div>';
 	$('.mid_box').html(briefHtml);
 }

 function setSwiper(body){
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
 }
 
 function setFoot(body){
	 var status = body.status || 1;
	 var curPoint = body.curPoint || 0;
	 var salePrice = body.salePrice || 0;
	 
	 $('#exchange').html(curPoint);
	 if (status == 2){
		// 当前商品被兑换完，显示
		 $('.bar-tab').find('.no_pay').show();
	     $('.go_pay').hide();
	     $('.no_credit').hide();
	 }else{
		 if (curPoint >= salePrice){
			// 当前积分足够兑换，显示
			 $('.bar-tab').find('.go_pay').show().nextAll().hide();
		 }else{
			// 积分不够显示
		     $('.bar-tab').find('.no_credit').show();
		     $('.go_pay').hide();
		     $('.no_pay').hide();
		 }
	 } 
 }