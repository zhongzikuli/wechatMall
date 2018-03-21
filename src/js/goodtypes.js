var oldtypeId;
var myswiper;

function checkIsNull(obj){
	if (obj == undefined || obj == null)
		return true;
	else
		return false;
}

function getArraySize(obj){
	if (obj == null || obj == undefined)
		return 0;
	return obj.length;
}

$(function () {
	// 如果是分享打开首页，且检测到分享者是微商，显示精选菜单
	if (xhq.getQuery("fromUserType") == 2){
	}else{
		$('#toshop').hide();
	}
	
	// 搜索栏点中进入搜索页
	$("#search").on('tap',function(){
		xhq.gotoUrl("search_record.html",{isWs:xhq.getQuery("isWs")});
	})
	
	// 设置明细类目的tap事件
	$(".content-block").on('tap','.search_item',function(){
		var linkurl = $(this).attr("linkurl");
		window.location.href=linkurl;
	});
	
	$.showIndicator();
	
	// 加载数据
	var param;
	if (xhq.getQuery("isWs") == 1){
		param={interId:'toc.getTypeHtml', getBannerDeatail:"ws_banner_detail.html?"+xhq.getVersion(),getSearchResult:"ws_search_result.html?"+xhq.getVersion()};
	}else{
		param={interId:'toc.getTypeHtml', getBannerDeatail:"banner_detail.html?"+xhq.getVersion(),getSearchResult:"search_result.html?"+xhq.getVersion()};
	}
	xhq.__runXHQ(param, function(data){
		if (data.status == 0){
			$.hideIndicator();
			$(".content-block").append(data.body);
			
			// 设置精选页面的轮播效果
			oldtypeId = $(".leftlist .active").attr("data_id");
			createSwiper(oldtypeId);
			
			$(".leftlist").on('tap','li a',function(){
				var typeId = $(this).attr("data_id");
				if (typeId == oldtypeId)
					return;
				oldtypeId = typeId;
				createSwiper(oldtypeId);
			})			
		}else{
			$.hideIndicator();
			$.toast(data.message);
		}
	});
	
	function createSwiper(typeId){
		// 判断对象是否存在
		var obj = $(".swcontainer"+typeId);
		if (obj == null || obj == undefined || obj.length<1){
			// 如果原来对象存在
			if(myswiper != undefined && myswiper != null) {
				myswiper.destroy(true);
				myswiper = null;
		    }
			return;
		}
		// 取得轮播图数量，如果大于1才置入loop属性
		var num = $(".swcontainer"+typeId).attr("imgnum");
		if (num > 1){
			myswiper = new Swiper(".swcontainer"+typeId, {
		        pagination: '.swpage'+typeId,
		        paginationClickable: true,
		        spaceBetween: 30,
		        centeredSlides: true,
		        autoplay: 2500,
		        autoplayDisableOnInteraction: false,
		        loop:true
		    });	
		}else{
			myswiper = new Swiper(".swcontainer"+typeId, {
		        pagination: '.swpage'+typeId,
		        paginationClickable: true,
		        spaceBetween: 30,
		        centeredSlides: true,
		        autoplay: 2500,
		        autoplayDisableOnInteraction: false
		    });	
		}
		
	}
	
	$("#tome").on("tap",function(){
		if (getLocalSession("userType") == 2)
			xhq.gotoUrl("ws_me.html");
		else
			xhq.gotoUrl("me.html");
    })
    $("#tohome").on("tap",function(){
    	if (xhq.getQuery("isWs"))
    		xhq.gotoUrl("ws_home.html");
    	else
    		xhq.gotoUrl("home.html");
    })
    $("#totour").on("tap",function(){
    	xhq.gotoUrl("tour.html");
    })
    $("#toshop").on("tap",function(){
    	xhq.gotoUrl("ws_shop.html");
    })
});