// 全局变量
var pageNo=0;
var pageSize=20;

// 判断当前加载中是否打开着
var isIndicator = false;
var isAppendMode = 1; // 是否是数据追加模式 默认为是，当为下拉刷新时设置为0

// 刷新相关
var $content = null;
var loading = false;

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

$(function () {
	// 注册下拉刷新页面
	$(document).on("pageInit", "#page-ptr", function(e, id, page) {
		$content = $(page).find(".content");
		
		$(page).on('infinite', function(e) {
			if (loading) return;
			openIndicator();
		    loading = true;
		    setTimeout(function() {
		        isAppendMode = 1;
		        loadData();
		        $.refreshScroller();
		    }, 1000);
		});
	});
	
	$.init();  
	
    // 1 开始处理轮播图
	openIndicator();
	
	// 开始加载商品数据
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.getGoodsOnline',channel:'C',sortType:1,filter:2,pageNo:pageNo,pageSize:pageSize};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (data.body == null || data.body.length<pageSize){
					$.detachInfiniteScroll($content);
					$('.infinite-scroll-preloader').remove();
				}
				loading = false;
			}else{
				hideIndicator();
				$.toast(data.message);
			}
			hideIndicator();	
		});
	}
	
	// 填充数据：mode=1覆盖  mode=2追回
	function setData(data){
		var html = "";
		if (isAppendMode == 0){
			$(".content .list_container").html("");
			isAppendMode = 1;
		}
			
		if (data.body != null && data.body.length > 0){
			for(var i=0; i<data.body.length; i++){ 
				var obj = data.body[i];
				if (obj.isSale ==1){
					html = html + getSaleHtml1(obj);
				}else{
					html = html + getNormalHtml2(obj);
				}
			} 
			$(".content .list_container").append(html);
		}
	}
	
    // 特卖商品
    function getSaleHtml1(obj){
    	var s = '<li class="goodsclass"><a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item" data-transition="slide-in"><div class="selling_pic"><img src='+obj.ImageUrl+'>' +
			'<div class="selling_icon"><img src="../img/icon_temai.png" alt=""></div>'+
    		   '</div><div class="selling_text"><div class="selling_title">'+obj.showName+'</div>'+
    		   '<div class="selling_price"><div class="price_detail"><p class="price_one"><span>&yen;'+(obj.salePrice/100)+'</span>';
    	if (obj.endTime !=null && obj.endTime != undefined){
    		s += '<span>'+obj.endTime+'</span>结束';
    	}
    	s += '</p></div><div class="go_buy"><p class="bonus">送积分:<span>'+(obj.money)+'</span></p></div></div></div></a></li>'
    	return s;
    }
    
    // 非特卖商品
    function getNormalHtml2(obj){
    	var s = '<li class="goodsclass"><a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item" data-transition="slide-in"><div class="selling_pic"><img src='+obj.ImageUrl+'></div>'+
		   '<div class="selling_text"><div class="selling_title">'+obj.showName+'</div>'+
		   '<div class="selling_price"><div class="price_detail"><p class="price_one"><span>&yen;'+(obj.salePrice/100)+'</span>';
		if (obj.endTime !=null && obj.endTime != undefined){
			s += '<span>'+obj.endTime+'</span>结束';
		}
		s += '</p></div><div class="go_buy"><p class="bonus">送积分:<span>'+(obj.money)+'</span></p></div></div></div></a></li>'
		return s;
    }
    
    $("#tome").on("tap",function(){
    	xhq.gotoUrl("me.html");
    })
    $("#tohome").on("tap",function(){
    	xhq.gotoUrl("home.html");
    })
    $("#totype").on("tap",function(){
    	xhq.gotoUrl("goodtypes.html");
    })
});
