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

//微信分享相关
var shareConfig={};

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

function shareHome(){
	shareConfig={
			title: "全名集市",
			desc: "全名集市",
			link: "http://t.cn/RxAuWCM",
			imgUrl:"http://qmjs.xiaohongquan.cn/dist/img/icon_logo.png"
		};
	xhq.initWXJsConfig();
}


$(function () {
	// 如果是从微信菜单直接进入，且当前人员角色为微商，则直接引导到店长版本
	if (xhq.getQuery("mode")==1 && getLocalSession("userType") == 2){
		$.alert('亲，您已经是店长了，系统将引导您至店长版本', '温馨提醒', function () {
			xhq.gotoUrl("ws_home.html",{isWs:1});
			return;
        });
	}
	
	// 如果是分享打开首页，且检测到分享者是微商，显示精选菜单
	if (xhq.getQuery("fromUserType") == 2){
	}else{
		$('#toshop').hide();
	}
	
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
	
    // 今日，明日样式切换
    $('.today').on('tap',function () {
		if (curtab == 1) return; // 如果原来就是今日就不处理
        $(this).addClass('active').siblings().removeClass('active');
		$(this).find('img').attr('src','../img/icon_fire.png');
        pageNo = 0;
		isAppendMode = 0;
		curdate = xhq.getToday();
		curtab = 1;
		openIndicator();
		$.attachInfiniteScroll($content);
		loadData();
    })
    $('.tomorrow').on('tap',function () {
    	if (curtab == 2) return; // 如果原来就是今日就不处理
        $(this).addClass('active');
		$('.today').removeClass('active');
		$('.today').find('img').attr('src','../img/icon_fire2.png');
        pageNo = 0;
		isAppendMode = 0;
		curdate = getTommow();
		curtab = 2;
		openIndicator();
		$.attachInfiniteScroll($content);
		loadData();
    })
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
						'<img src='+obj.imgUrl+' alt=""></a></div>';
					}else{
						swiperHtml = swiperHtml + '<div class="swiper-slide"><a class="external" href="'+obj.linkUrl+'">' +
						'<img src='+obj.imgUrl+' alt=""></a></div>';
					}
				} 
			}
			swiperHtml = swiperHtml +'</div><div class="swiper-pagination"></div>';
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
		var param={interId:'toc.getGoodsOnline',channel:'C',date:curdate,sortType:1,filter:1,pageNo:pageNo,pageSize:pageSize,orgId:xhq.getQuery("orgId")};
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
				} else if (obj.status == 2 || obj.status==4){
					html = html + getStatusHtml2(obj);
				}else if (obj.status == 3){
					html = html + getStatusHtml3(obj);
				}
			} 
			$(".content-block .list_container").append(html);
		}
	}
	
	// 进行中的商品
	function getStatusHtml1(obj){
		var s = '<li>'+
			'<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
			'<div class="li_l"><img src='+obj.ImageUrl+' alt=""></div>'+
			'<div class="li_r">'+
				'<div class="up_con">'+obj.showName+'</div>'+
				'<div class="mid_con">'+
					'<div class="pri_l">'+
						'<p>&yen;<span class="pri_one">'+(obj.salePrice/100)+'</span><s>&yen;<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>'+
					'</div>'+
					'<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
				'</div>'+
				'<div class="down_con">'+
					'<div class="sur_l">';

				var per =  getPercent(obj.totalStock,obj.stock);
					 if(per==1){
						 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
							 '<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>';
					 }else if (per >0.9&&per<1){
						s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
								'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>';
					}else{
						s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
								'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' ;
					}
						s+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>' +
							'<div class="sur_r">立即抢<img src="../img/icoJiantou1.png"></div>'+
				'</div>'+
			'</div>'+
		'</a>'+
	'</li>';

		return s;
	}
	// 已售完的商品
	function getStatusHtml2(obj){
		var s = '<li class="over">'+
        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
            '<div class="li_l"><img src='+obj.ImageUrl+' alt=""></div>'+
            '<div class="li_r">'+
                '<div class="up_con">'+obj.showName+'</div>'+
                '<div class="mid_con">'+
                    '<div class="pri_l">'+
                        '<p>&yen;<span class="pri_one">'+(obj.salePrice/100)+'</span><s>&yen;<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>'+
                    '</div>'+
                    '<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
                '</div>'+
                '<div class="down_con">'+
                    '<div class="sur_l">'+
                        '<p class="surplus">'+
                            '<span class="span_f"></span>'+
                            '<span class="span_s">剩余<span>0</span>个</span>'+
                        '</p>'+
                    '</div>'+
                    '<div class="sur_r">已抢光<img src="../img/icoJiantou1.png"></div>'+
                '</div>'+
            '</div>'+
        '</a>'+
    '</li>';

		return s;
	}
	// 未开始的商品
	function getStatusHtml3(obj){
		var s = '<li class="waiting">'+
        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
            '<div class="li_l"><img src='+obj.ImageUrl+' alt=""></div>'+
            '<div class="li_r">'+
                '<div class="up_con">'+obj.showName+'</div>'+
                '<div class="mid_con">'+
                    '<div class="pri_l">'+
                        '<p>&yen;<span class="pri_one">'+(obj.salePrice/100)+'</span><s>&yen;<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>'+
                    '</div>'+
                    '<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
                '</div>'+
                '<div class="down_con">'+
                    '<div class="sur_l">'+
                        '<p class="surplus">'+
                            '<span class="span_f"></span>'+
                            '<span class="span_s">剩余<span>'+obj.stock+'</span>个</span>'+
                        '</p>'+
                    '</div>'+
                    '<div class="sur_r">即将开始<img src="../img/icoJiantou1.png"></div>'+
                '</div>'+
            '</div>'+
        '</a>'+
    '</li>';
		return s;
	}
	
	shareHome();
	
	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);
		wx.onMenuShareTimeline(shareConfig);
	});

	function getPercent(total, stock){
		if (total == 0)
			return 1;
		return stock/total;
	}
	
	$("#tome").on("tap",function(){
		if (getLocalSession("userType") == 2)
			xhq.gotoUrl("ws_me.html");
		else
			xhq.gotoUrl("me.html");
    })
    $("#totour").on("tap",function(){
    	xhq.gotoUrl("tour.html");
    })
    $("#totype").on("tap",function(){
    	xhq.gotoUrl("goodtypes.html");
    })
    $("#toshop").on("tap",function(){
    	xhq.gotoUrl("ws_shop.html");
    })
});
