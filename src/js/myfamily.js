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
	
	custId = getLocalSession("custId") || "0";
	var userType = getLocalSession("userType") || "1";
	if (userType != 2 || custId <= 0){
		xhq.gotoRegUrl();
		return;
	}
	
	$.init();  
	
	// 处理我的资料
	$("#meImg").attr("src",getLocalSession("headimgUrl")) || DEFAULT_HEADIMG;
	$("#meLevel").html(getLocalSession("level") || "消费者");
	$("#meName").html(getLocalSession("nickName") || "暂无昵称");
	$("#meCode").html(getLocalSession("inviteCode") || "无邀请码");
	
	openIndicator();
	
	// 开始加载家族成员
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.getCustChilds',channel:'C',custId:custId};
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
				html += '<li class="name">' +
	                '<div class="name_pic"><img src='+(obj.headimgUrl || DEFAULT_HEADIMG)+' alt=""></div>'+
	                '<div class="name_infor">'+
	                    '<span>'+(obj.nickName || '暂无昵称')+'</span>'+
	                    '<span class="title">'+(obj.level || '消费者')+'</span></div></li>';
			} 
			$(".content .list_container").append(html);
		}
	}
});
