// 全局变量
var pageNo=0;
var pageSize=10;

// 判断当前加载中是否打开着
var isIndicator = false;

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
	// 如果是分享打开首页，且检测到分享者是微商，显示精选菜单
	if (xhq.getQuery("fromUserType") == 2){

	}else{
		$('#toshop').hide();
	}
	
	// 注册下拉刷新页面
	$(document).on("pageInit", "#page-ptr", function(e, id, page) {
		$content = $(page).find(".content");
		
		$(page).on('infinite', function(e) {
			if (loading) return;
			openIndicator();
		    loading = true;
		    setTimeout(function() {
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
		var param={interId:'toc.getGrouponList',channel:'C',pageNo:pageNo,pageSize:pageSize};
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
		
		if (data.body != null && data.body.length > 0){
			for(var i=0; i<data.body.length; i++){ 
				var obj = data.body[i];
				html = html + getSaleHtml1(obj);
			} 
			$(".content .list_box").append(html);
		}
	}
	
    // 特卖商品
    function getSaleHtml1(obj){
    	s = '<li>'+
      '<a href="tour_goods_detail.html?online_id='+obj.onlineId+'&r='+Math.random()+'&'+xhq.getVersion()+'" class="external">'+
      '<div class="goods_pic"><img src='+obj.ImageUrl+' alt=""></div>'+
      '<div class="goods_text">'+obj.showName+'</div>'+
  '<div class="goods_detail">'+
      '<div class="tour_num"><span>'+obj.grouponNum+'</span>人团</div>'+
      '<div class="tour_pri">'+
      '<span class="pri_one">&yen;<span>'+(obj.grouponPrice/100)+'</span></span>'+
  '<s class="pri_two">&yen;<span>'+(obj.purchasePrice/100)+'</span></s>'+
  '</div>'+
  '<div class="tour_bri">已团<span>'+obj.salesVolume+'</span>单</div>'+
      '<div class="go_tour">去开团<img src="../img/icoJiantou1.png"></div>'+
      '</div>'+
      '</a>'+
      '</li>';
    	return s;
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
    $("#totype").on("tap",function(){
    	xhq.gotoUrl("goodtypes.html");
    })
    $("#toshop").on("tap",function(){
    	xhq.gotoUrl("ws_shop.html");
    })
});
