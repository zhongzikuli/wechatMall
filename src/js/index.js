function getTommow(){
	var now = new Date();
	now.setDate(now.getDate()+1);
	return now.getFullYear()+"-"+((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"-"+((now.getDate()<10?"0":"")+now.getDate());
}

// 全局变量
var pageNo=0;
var pageSize=20;
var curdate=xhq.getToday();//默认为当前日期

// 判断当前加载中是否打开着
var isIndicator = false;
var isAppendMode = 1; // 是否是数据追加模式 默认为是，当为下拉刷新时设置为0

// 刷新相关
var $content = null;
var loading = false;

// 日期切换
var curtab = 1; //今日 2为明日

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
		$content = $(page).find(".content-block");
		
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
	
	// 添加今日的tap事件
	$("#todays").on('tap',function(){
		if (curtab == 1) return; // 如果原来就是今日就不处理
		$(this).find('.selling_text').addClass('active');
		$(".selling_date").addClass('active');
		$(".item-title").removeClass('active');
		pageNo = 0;
		isAppendMode = 0;
		curdate = xhq.getToday();
		curtab = 1;
		openIndicator();
		$.attachInfiniteScroll($content);
		loadData();
	});
	$("#torrmors").on('tap',function(){
		
		if (curtab == 2) return; // 如果原来就是今日就不处理

		$(this).find('.item-title').addClass('active');
		$(".selling_date").removeClass('active');
		$(".selling_text").removeClass('active');
		pageNo = 0;
		isAppendMode = 0;
		curdate = getTommow();
		curtab = 2;
		openIndicator();
		$.attachInfiniteScroll($content);
		loadData();
	});
	
	// 添加按钮区的点击事件：如果用的是href，则在返回后再点击会失效
	$("#changeBtn").on('tap',function(){
		xhq.gotoUrl("change_list.html");
	});
	$("#orderBtn").on('tap',function(){
		xhq.gotoUrl("order_list.html");
	});
	$("#familyBtn").on('tap',function(){
		if (getLocalSession("userType") !=2){
			xhq.gotoRegUrl();
			return;
		}
		xhq.gotoUrl("my_family.html");
	});
	$("#inviteBtn").on('tap',function(){
		if (getLocalSession("userType") !=2){
			xhq.gotoRegUrl();
			return;
		}
		xhq.gotoUrl("invite_friend.html");
	});
	
    // 1 开始处理轮播图
	openIndicator();
	
    // 加载轮播图 和商品数据
	var swiperHtml = '<div class="swiper-wrapper">';
	var param={interId:'toc.getIndexBanners',channel:'C'};
	xhq.__runXHQ(param, function(data){
		// 检测返回值
		if (data.status == 0){
			if (data.body != null && data.body.length > 0){
				for(var i=0; i<data.body.length; i++){ 
					var obj = data.body[i];
					if (obj.actType==2){
						swiperHtml = swiperHtml + '<div class="swiper-slide"><a href="banner_detail.html?actId='+obj.actId+'&r='+Math.random()+'&'+xhq.getVersion()+'">' +
						'<img src='+obj.imgUrl+'>' +
						'</a></div>';
					}else{
						swiperHtml = swiperHtml + '<div class="swiper-slide"><a class="external" href="'+obj.linkUrl+'">' +
						'<img src='+obj.imgUrl+'>' +
						'</a></div>';
					}
				} 
			}
			swiperHtml = swiperHtml +'</div>'+'<div class="swiper-pagination"></div>';
			$('.swiper-container').html(swiperHtml);
		
			// 配置轮播图
			if (data.body.length > 1){
				var swiper = new Swiper('.swiper-container', {
			        pagination: '.swiper-pagination',
			        paginationClickable: true,
			        spaceBetween: 30,
			        centeredSlides: true,
			        autoplay: 2500,
			        autoplayDisableOnInteraction: false
			    });
			}
			
			// 开始加载商品数据
			loadData();
		}else{
			hideIndicator();
			$.toast(data.message);
		}
	});
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.getGoodsOnline',channel:'C',date:curdate,sortType:1,filter:1,pageNo:pageNo,pageSize:pageSize};
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
			$(".content-block .list_container").html("");
			isAppendMode = 1;
		}
			
		if (data.body != null && data.body.length > 0){
			for(var i=0; i<data.body.length; i++){ 
				var obj = data.body[i];
				if (obj.status==1){
					html = html + getStatusHtml1(obj);
				}else if (obj.status == 2 || obj.status==4){
					html = html + getStatusHtml2(obj);
				}else if (obj.status == 3){
					html = html + getStatusHtml3(obj);
				}
			} 
			$(".content-block .list_container").append(html);
			updateLineWidth();
		}
	}

	function updateLineWidth(){
		for (var i = 0; i < $(".surplus").length; i++){
			var surplusW = $(".surplus").width()
			var totalStock = $(".surplus").eq(i).attr("totalStock")
			var stock = $(".surplus").eq(i).attr("stock")
			var status = $(".surplus").eq(i).attr("status")
			var per =  getPercent(totalStock,stock)
			if(status==2||status==4){
				$(".surplus").eq(i).find(".span_f").attr("style","width:0");
			}else{
				if (per >= 1){
					$(".surplus").eq(i).find(".span_f").attr("style","width:"+surplusW+"px;border-radius:8px;");
				}else{
					if (per == 0){
						$(".surplus").eq(i).find(".span_f").attr("style","width:0");
					}else if(per >= 0.9){
						$(".surplus").eq(i).find(".span_f").attr("style","width:"+(surplusW*0.9)+"px");
					}else{
						var span_fW=surplusW*per;
						$(".surplus").eq(i).find(".span_f").attr("style","width:"+span_fW+"px;");
					}
				}
			}
			
		}
	}

	// 进行中的商品
	function getStatusHtml1(obj){
		var s = '<li class="goodsclass"><a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item ongoing" data-transition="slide-in"><div class="selling_pic">'+
			'<img src='+obj.ImageUrl+'>';
		//alert("totalStock="+obj.totalStock+"stock="+obj.stock)
		var per =  getPercent(obj.totalStock,obj.stock)
		//var surplusW =$('.surplus').width();
		if (per >= 1){
			s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f"   style="width:0rem;border-radius:8px;">';
		}else{

			if (per == 0){
				s+='<p class="surplus" style="background:rgba(0,0,0,0.25)" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span  class="span_f" style="width:0">';
			}else if (per >= 0.9){
				//surplusW = $('.surplus').width();
				s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" style="width:0rem">';
			}else{
//				surplusW = $('.surplus').width();
				//var span_fW=surplusW*per;
				s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f"  style="width:0rem" >';
			}
		}
			s+='</span><span class="span_s">剩余<span>'+obj.stock+'</span>个</span> </p>'+
			'</div>'+
			'<div class="selling_text">'+
			'<div class="selling_title">'+obj.showName+'</div>'+
			'<div class="selling_price">'+
			'<div class="price_detail">'+
			'<p class="price_one"><span>特卖价</span><span>&yen;'+(obj.salePrice/100)+'</span></p>'+
			'<p class="price_two"> 平日：<s>&yen;'+(obj.purchasePrice/100)+'</s></p>';
		if (obj.endTime == null || obj.endTime == undefined){
			s += '<p class="deadline"></p>'+
				'</div>'+
				'<div class="go_buy">立即抢<p class="bonus">送积分：<span>'+(obj.money)+'</span></p></div>'+
				'</div>'+
				'</div></a></li>';
		}else{
			s += '<p class="deadline"><span>'+obj.endTime+'</span>结束</p>'+
				'</div>'+
				'<div class="go_buy">立即抢<p class="bonus">送积分：<span>'+(obj.money)+'</span></p></div>'+
				'</div>'+
				'</div></a></li>';
		}
		return s;
		
	}
  
    // 已售完
    function getStatusHtml2(obj){
    	return '<li class="goodsclass"><a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item ended" data-transition="slide-in"><div class="selling_pic">'+
        '<img src='+obj.ImageUrl+'>'+
        '<p class="surplus" stype="background:rgba(0,0,0,0.25)" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" stype="width:0"></span><span class="span_s">剩余<span>0</span>个</span></p>'+
        '</div>'+
        '<div class="selling_text">'+
        '<div class="selling_title">'+obj.showName+'</div>'+
        '<div class="selling_price">'+
        '<div class="price_detail">'+
        '<p class="price_one"><span>特卖价</span><span>&yen;'+(obj.salePrice/100)+'</span></p>'+
        '<p class="price_two"> 平日：<s>&yen;'+(obj.purchasePrice/100)+'</s></p>'+
        '<p class="deadline">抢购结束</p>'+
        '</div>'+
        '<div class="go_buy">已抢完<p class="bonus">送积分：<span>'+(obj.money)+'</span></p></div>'+
        '</div>'+
        '</div></a></li>';
    }
   
    // 未开始
    function getStatusHtml3(obj){
		
    	return '<li class="goodsclass" totalStock='+obj.totalStock+' data_id='+obj.onlineId+'><a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item waiting" data-transition="slide-in"><div class="selling_pic">'+
        '<img src='+obj.ImageUrl+'>'+
		'<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" stype="width:width:0rem",border-radius:8px"></span><span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p>'+
        '</div>'+
        '<div class="selling_text">'+
        '<div class="selling_title">'+obj.showName+'</div>'+
        '<div class="selling_price">'+
        '<div class="price_detail">'+
        '<p class="price_one"><span>特卖价</span><span>&yen;'+(obj.salePrice/100)+'</span></p>'+
        '<p class="price_two">平日：<s>&yen;'+(obj.purchasePrice/100)+'</s></p>'+
        '<p class="deadline "><span>'+obj.startTime+'</span>开始抢购</p>'+
        '</div>'+
        '<div class="go_buy">立即抢<p class="bonus">送积分：<span>'+(obj.money)+'</span></p></div>'+
        '</div>'+
        '</div></a></li>';
    }

    // 特卖品类导航获取时间
    var myDate = new Date();
    var month = myDate.getMonth()+1;
    var date = myDate.getDate();
    var weekday=new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六')
    $('.special_date').html(month + '.' + date);
    $('.special_weekday').html(weekday[myDate.getDay()]);
    

    function getPercent(total, stock){
    	if (total == 0)
    		return 1;
    	return stock/total;
    }
    
    $("#tome").on("tap",function(){
    	xhq.gotoUrl("me.html");
    })
    $("#tofresh").on("tap",function(){
    	xhq.gotoUrl("tour.html");
    })
    $("#totype").on("tap",function(){
    	xhq.gotoUrl("goodtypes.html");
    })
});


