// 全局变量
var pageNo=0;
var pageSize=10;

var custId=0;
var userType=0;

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
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (userType != 2 || custId <= 0){
		$.toast("非合法用户，无法访问");
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
	
	// 开始加载提现记录
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.moneyWithDrawList',channel:'C', custId: custId,pageNo:pageNo,pageSize:pageSize};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (! data.body || !data.body.data ||  data.body.data.length<pageSize){
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
					html = html + getHtml1(obj);
			}
			$(".content .list_container").append(html);
		}
	}
	
    // 进行中有库存
    function getHtml1(income){
    	var html="";
    	if (income.status==1){
    		html += '<li class="list_item dealing">'+
    					'<div class="box_l">'+
	    					'<span>提现申请处理中</span><br>'+
	    					'<span class="draw_time">'+income.createTime+'</span>'+
    					'</div>'+
    					'<div class="box_r">&yen;'+(income.money/100)+'</div>'+
    				'</li>';
    	}else if (income.status == 2){
    		html += '<li class="list_item success">'+
						'<div class="box_l">'+
							'<span>提现成功</span><br>'+
							'<span class="draw_time">'+income.createTime+'</span>'+
						'</div>'+
						'<div class="box_r">&yen;'+(income.money/100)+'</div>'+
					'</li>';
    	}else{
    		html += '<li class="list_item failing">'+
					'<div class="box_l">';
    				if (income.remark)
						html += '<span>提现失败('+income.remark+')</span><br>';
    				else
    					html += '<span>提现失败</span><br>';
						html+='<span class="draw_time">'+income.createTime+'</span>'+
					'</div>'+
					'<div class="box_r">&yen;'+(income.money/100)+'</div>'+
				'</li>';
    	}
    	
    	return html;
    }
   
    $("#toDraw").on('tap',function(){
    	openIndicator();
    	// 获取已绑定的银行卡资料
    	var param={interId:'toc.getCustBankInfo',channel:'C', custId: custId};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				if (data.body && data.body.bankcard){
					xhq.gotoUrl("to_bank1.html",{bankname:data.body.bankname,bankcard:data.body.bankcard,openbank:data.body.openbank,cardowner:data.body.cardowner});
				}else{
					xhq.gotoUrl("bind_card.html");
				}
			}else{
				hideIndicator();
				$.toast(data.message);
			}
			hideIndicator();	
		});
    });
});
