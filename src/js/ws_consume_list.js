// 全局变量
var pageNo=0;
var pageSize=10;

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

var custId =0;
var userType =0;
$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
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
	
	openIndicator();
	
	// 开始加载商品数据
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.cashConsumeList',channel:'C', custId: custId,pageNo:pageNo,pageSize:pageSize};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (! data.body || !data.body ||  data.body.length<pageSize){
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
		if (data.body && data.body && data.body.length > 0){
			for(var i=0; i<data.body.length; i++){ 
				var obj = data.body[i];
				if (obj.status==3){ // 纳新赠送
					html = html + getHtml1(obj);
				}else if (obj.status == 1){//消费赠送
					html = html + getHtml2(obj);
				}else if (obj.status == 4){//消费抵扣
					html = html + getHtml4(obj)
				}else{
					html = html + getHtml3(obj);
				}
			}
			$(".content .list_container").append(html);
		}
	}
	
    // 纳新赠送
    function getHtml1(income){
    	var incomeHtml ='<li>';
			incomeHtml +='<div class="div_l">';
			incomeHtml +='<img src='+(income.headimgUrl || DEFAULT_HEADIMG)+'>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_m">';
			incomeHtml +='<p class="name">'+(income.nickName || '无昵称')+'</p>';
			incomeHtml +='<p class="time">'+income.createTime+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_r">';
			incomeHtml +='<p class="source">纳新赠送</p>';
			incomeHtml +='<p class="time">+¥'+((income.cash || 0)/100)+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='</li>';
    	return incomeHtml;
    }
    
    // 消费赠送
    function getHtml2(income){
    	var incomeHtml ='<li>';
			incomeHtml +='<div class="div_l">';
			incomeHtml +='<img src='+(income.headimgUrl || DEFAULT_HEADIMG)+'>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_m">';
			incomeHtml +='<p class="name">'+(income.nickName || '无昵称')+'</p>';
			incomeHtml +='<p class="time">'+income.createTime+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_r">';
			incomeHtml +='<p class="source">消费赠送</p>';
			incomeHtml +='<p class="time">+¥'+((income.cash || 0)/100)+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='</li>';
    	return incomeHtml;
    }
    
    // 消费抵扣
    function getHtml4(income){
    	var incomeHtml ='<li>';
			incomeHtml +='<div class="div_l">';
			incomeHtml +='<img src='+(income.headimgUrl || DEFAULT_HEADIMG)+'>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_m">';
			incomeHtml +='<p class="name">'+(income.nickName || '无昵称')+'</p>';
			incomeHtml +='<p class="time">'+income.createTime+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_r">';
			incomeHtml +='<p class="source">消费抵扣</p>';
			incomeHtml +='<p class="time">-¥'+((income.cash || 0)/100)+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='</li>';
    	return incomeHtml;
    }
    
    // 其它成员贡献
    function getHtml3(income){
    	var incomeHtml ='<li>';
			incomeHtml +='<div class="div_l">';
			incomeHtml +='<img src='+(income.headimgUrl || DEFAULT_HEADIMG)+'>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_m">';
			incomeHtml +='<p class="name">'+(income.nickName || '无昵称')+'</p>';
			incomeHtml +='<p class="time">'+income.createTime+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='<div class="div_r">';
			incomeHtml +='<p class="source">其它成员贡献</p>';
			incomeHtml +='<p class="time">+¥'+((income.cash || 0)/100)+'</p>';
			incomeHtml +='</div>';
			incomeHtml +='</li>';
    	return incomeHtml;
    }
   
});
