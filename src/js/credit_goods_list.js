// 全局变量
// 判断当前加载中是否打开着
var isIndicator = false;

function openIndicator(){
	$.showIndicator();
	isIndicator = true;
}

function hideIndicator(){
	if (isIndicator){
		$.hideIndicator();
		isIndicator = false;
	}
}

var debug = true; 
var loading = false;
// 最多可加载的条目
var maxItems = 20;
// 每次加载添加多少条目
var itemsPerLoad = 6;
var globalIndex = 0;

function gotoExchange(onlineId){
    xhq.gotoUrl("credit_goods_detail.html",{onlineId:onlineId});
}
//商品
function getItemHtml(body){
	if (debug) console.log('index='+JSON.stringify(body));
	var status = body.status;
	var divClass = status == 2 ? 'over' : 'ongoing';
	var btnText = status == 2 ? '已兑完' : '立即兑换';
	var onClick = 'onclick="gotoExchange('+body.onlineId+')"';
	s = '<li><a href="#" class="'+divClass+'" '+onClick+'>'+
    '<div class="goods_pic"><img src="'+body.ImageUrl+'" alt=""></div>'+
    '<div class="goods_text">'+body.showName+'</div>'+
    '<div class="goods_price">'+
    '<div class="pri_num"><span>'+body.salePrice+'</span>积分</div>'+
    '<div class="go_pay">'+btnText+'</div>'+
    '</div>'+
    '</a>'+
    '</li>';
	return s;
}

function addItems(data, number, lastIndex) {
    // 生成新条目的HTML
    var html = '';
    var temp = '';
    if (debug) console.log('addItems='+JSON.stringify(data));
    for (var i = lastIndex + 1; i <= lastIndex + number; i++) {
    	for (var t = 0; t <= 1; t++){
    		if (globalIndex < data.length){
        		temp = getItemHtml(data[globalIndex++]);
            	html += temp;
        	}else{
        		break;
        	}
    	}
    }
    // 添加新条目
    $('.infinite-scroll-bottom .list-box').append(html);
}

function setData(data){
	// 商品个数小于单页允许加载个数，则注销无限加载事件，删除加载提示符，以防不必要的加载
	if (data.length <= itemsPerLoad){
        $.detachInfiniteScroll($('.infinite-scroll'));
        $('.infinite-scroll-preloader').remove();
	}
	//预先加载8条
	addItems(data, itemsPerLoad, 0);
	// 上次加载的序号
	var lastIndex = 8;
	// 注册'infinite'事件处理函数
	$(document).on('infinite', '.infinite-scroll-bottom',function() {
		
	    // 如果正在加载，则退出
	    if (loading) return;
	    // 设置flag
	    loading = true;
	    // 模拟1s的加载过程
	    setTimeout(function() {
	        // 重置加载flag
	        loading = false;
	        if (lastIndex >= maxItems || globalIndex >= data.length) {
	            // 加载完毕，则注销无限加载事件，以防不必要的加载
	            $.detachInfiniteScroll($('.infinite-scroll'));
	            // 删除加载提示符
	            $('.infinite-scroll-preloader').remove();
	            return;
	        }
	        // 添加新条目
	        addItems(data, itemsPerLoad, lastIndex);
	        // 更新最后加载的序号
	        lastIndex = $('.list_box li').length;
	        //容器发生改变,如果是js滚动，需要刷新滚动
	        $.refreshScroller();
	    }, 1000);
	});
}

function loadData(){
	openIndicator();
	var param={interId:'toc.getExchangeList',channel:'C'};
	xhq.__runXHQ(param, function(data){
		if (data.status == 0){
			var body = data.body;
			if(body != undefined && body != null && body.length > 0){
				if (debug) console.log(JSON.stringify(data));
				if (body != undefined && body != null && body.length > 0){
					setData(data.body);
				}
			}else{
				 $.detachInfiniteScroll($('.infinite-scroll'));
			     $('.infinite-scroll-preloader').remove();
			}
		}else{
			$.toast(data.message);
		}
		hideIndicator();	
	});
}

$(function () {
	loadData();
	$.init();
});