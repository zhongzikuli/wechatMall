// 全局变量
var pageNo=0;
var pageSize=10;

// 刷新相关
var $content = null;
var loading = false;

var shareConfig={};
var shareTitle = (getLocalSession("nickName")||"")+"的店铺";
var shareIcon = getLocalSession("headimgUrl")||DEFAULT_HEADIMG;
var shareUrl=xhq.getDomainUrl()+"ws_shop.html?fromCustId="+getLocalSession("custId")+"&fromUserType=2&"+xhq.getVersion();
var shareConfig={
	    title: shareTitle, 
	    desc: "全民集市，特卖好货。自买返利，分享赚钱。成为会员更有多种福利等着你",
	    link: shareUrl,
	    imgUrl: shareIcon
	};

function openIndicator(){
	$.showIndicator();
	isIndicator = true;
}

function showNoDataPage() {
	$("#content-block1").hide();
	$("#content-block2").show();
}

function hideIndicator(){
	if (isIndicator){
		$.hideIndicator();
		isIndicator = false;
	}
	loading = false;
}

var custId =0;
var userType =0;
$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (custId <= 0 || userType == 1){
		xhq.gotoRegUrl();
		return;
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
	
	openIndicator();
	$("#input_image").attr("src",getLocalSession("headimgUrl"));
	$("#input_level").html(getLocalSession("level")||"店长");
	$("#input_sname").html(getLocalSession("nickName")||''+"的店铺");
	
	// 开始加载商品数据
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.custOnlineList',channel:'C', wsId:custId,pageNo:pageNo,pageSize:pageSize};
		xhq.__runXHQ(param, function(data){
			hideIndicator();
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (!data.body ||  data.body.length<pageSize){
					$.detachInfiniteScroll($content);
					$('.infinite-scroll-preloader').remove();
				}
				if (pageNo == 1 && (!data.body || data.body.length == 0)){
					showNoDataPage();
				}
				loading = false;
			}else{
				$.toast(data.message);
			}
		});
	}
	
	// 填充数据
	function setData(data){
		var html = "";
		if (data.body && data.body && data.body.length > 0){
			for(var i=0; i<data.body.length; i++){ 
				var obj = data.body[i];
				html = html + getHtml(obj,i);
			}
			$(".content-block .list_container").append(html);
		}else{
			html = html;
			$(".content-block").append(html);
		}
	}

	function getHtml(obj, i){
		var s;
		if (i == 0){
			s = '<li class="f_li">';
		}else{
			s = '<li>';
		}
		if (xhq.getQuery("isWs"))
			s += '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">';
		else
			s += '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'&isWs=1" class="item-link list-button external">';
		
			s+='<div class="li_l">'+
	            '<img src='+obj.ImageUrl+' alt="">'+
	        '</div>'+
	        '<div class="li_r">'+
	            '<div class="up_con">'+obj.showName+'</div>'+
	            '<div class="mid_con">'+
	                '<div class="pri_l">';
			if (obj.purchasePrice || 0 > 0)
	            s+='<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s>¥<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>';
			else
				s+='<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s><span class="pri_two"></span></s></p>';
	                s+='</div>'+
	                '<div class="pri_r">赚: ¥<span>'+(obj.bonus/100)+'</span></div>'+
	            '</div>'+
	            '<div class="down_con">'+
	                '<div class="sur_l">';
		if (obj.stock <= 0){
				 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="0" style="background: rgb(255,255,255)">' +
						'<span class="span_f" style="background: rgba(0,0,0,0.4);width:4.5rem" ></span>' +
						'<span class="span_s">剩余<span>0</span>个</span></div></div></div></a>';
		}else{
			var per =  getPercent(obj.totalStock,obj.stock);
			 if(per==1){
				 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
					 	'<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>' +
					 	'<span class="span_s">剩余<span>'+obj.stock+'</span>个</span>';
			 }else if (per >0.9&&per<1){
				 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
						'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>' +
					 	'<span class="span_s">剩余<span>'+obj.stock+'</span>个</span>';
			 }else{
				 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
						'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' +
					    '<span class="span_s">剩余<span>'+obj.stock+'</span>个</span>' ;
			 }
			s+='</p></div></div></div></a>';
		}
		if (i == 0){
			s+= '<div class="sur_m">'+
				'<img src="../img/icon_delete@2x.png" alt="" class="delete" data_id='+obj.onlineId+'>'+
				'<img src="../img/icon_up@2x.png" alt="" class="up none_tap" data_id='+obj.onlineId+'>'+
			'</div></li>';
		}else{
			s+= '<div class="sur_m">'+
				'<img src="../img/icon_delete@2x.png" alt="" class="delete" data_id='+obj.onlineId+'>'+
				'<img src="../img/icon_up_active%20@2x.png" alt="" class="up" data_id='+obj.onlineId+'>'+
				'</div></li>';
		}

	    return s;
	}
	
	function getPercent(total, stock){
		if (total == 0)
			return 1;
		return stock/total;
	}
	
	$(".list_container").on('tap', 'li .delete',function(){
    	var obj = $(this);
		var onlineId = $(this).attr("data_id");
		var param={interId:'toc.custDownOnline',channel:'C',custId:getLocalSession("custId"),onlineId:onlineId};
		$.showIndicator();
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				var li = obj.parent().parent();
				if (li.hasClass("f_li")){
					var next = li.next();
					next.addClass("f_li");
					next.find(".up").addClass('none_tap').attr("src","../img/icon_up@2x.png")
				}
				li.hide();
				
				$.toast("删除成功");
			}else{
				$.toast(data.message);
			}
		});
	})
	
	$(".list_container").on('tap', 'li .up',function(){
    	var obj = $(this);
		var onlineId = $(this).attr("data_id");
		var param={interId:'toc.custTopOnline',channel:'C',custId:getLocalSession("custId"),onlineId:onlineId};
		$.showIndicator();
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				$.toast("置顶成功");
			}else{
				$.toast(data.message);
			}
		});
	})
	
	xhq.initWXJsConfig();
	
	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);	
		wx.onMenuShareTimeline(shareConfig);
    });
	
	$("#tohome").on('tap',function(){
		if (xhq.getQuery("fromUserType") == 2)
			xhq.gotoUrl("home.html");
		else
			xhq.gotoUrl("ws_home.html");
		
	})
});
