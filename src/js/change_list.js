// 全局变量
var pageNo=0;
var pageSize=20;

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
	// 如果不是会员，不允许打开
	if (!(xhq.isCustomer())){
		xhq.gotoRegUrl();
		return;
	}
	
	// 注册下拉刷新页面
	$(document).on("pageInit", "#page-ptr", function(e, id, page) {
		$content = $(page).find(".sale_list");
		
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
		var param={interId:'toc.getGoodsOnline',channel:'C',sortType:1,filter:3,pageNo:pageNo,pageSize:pageSize};
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
				// 处理换购进行中有库存和进行中无库存两种情况
				if (obj.status ==1){
					html = html + getHtml1(obj);
				}else if (obj.status == 2){
					html = html + getHtml2(obj);
				}
			} 
			$(".sale_list .list_container").append(html);
			updateLineWidth();
		}
	}



	function updateLineWidth(){
		for (var i = 0; i < $(".progress").length; i++){
			var progressW = $(".progress").width();
			var totalStock = $(".progress").eq(i).attr("totalStock");
			var stock = $(".progress").eq(i).attr("stock");
			var status = $(".progress").eq(i).attr("status");
			var per =  getPercent(totalStock,stock);
			
			if(status==2){
				$(".progress").eq(i).find(".span_f").attr("style","width:0");
			}else{
				if (per >= 1){
					$(".progress").eq(i).find(".span_f").attr("style","width:4rem;border-radius:8px");
				}else{
					if (per == 0){
						$(".progress").eq(i).find(".span_f").attr("style","width:0");
					}else if(per >= 0.9){
						$(".progress").eq(i).find(".span_f").attr("style","width:3.6rem");
					}else{
						var span_fW=progressW*per;
						$(".progress").eq(i).find(".span_f").attr("style","width:"+span_fW+"px");
					}
				}
			}

		}
	}
    // 进行中有库存
    function getHtml1(obj){
    	var s = '<li>'+
	        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item ongoing external" data-transition="slide-in">'+
	            '<div class="selling_pic">'+
	                '<img src='+obj.ImageUrl+'>'+
	            '</div>'+
	            '<div class="selling_text">'+
	                '<div class="selling_title">'+obj.showName+'</div>'+
	                '<div class="price_detail">'+
	                    '<div class="price_one">'+
	                        '<p class="change_price">'+
	                            '<span>换购价</span>'+
	                            '<span class="change_span">&yen;'+(obj.salePrice/100)+'</span>'+
	                            '<s>&yen;'+(obj.purchasePrice/100)+'</s>'+
	                        '</p>';

    	var per = getPercent(obj.totalStock, obj.stock);
		if (per >= 1){
			s+='<p class="progress" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" style="width:4rem;border-radius:8px">';
		}else{
			var span_fW=4*per;
			if (per == 0){
				s+='<p class="progress" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'" style="background:rgba(0,0,0,0.25)"><span class="span_f" style="width:0">';
			}if (per >= 0.9){
				s+='<p class="progress" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" style="width:3.6rem">';
			}else{
				s+='<p class="progress" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'"><span class="span_f" style="width:'+(span_fW)+'rem">';
			}
		}
		s+='</span><span class="span_s">剩余<span>'+obj.stock+'</span>个</span> </p>'+
	                    '</div>'+
					'<div class="go_change">立即换购</div></div></div></a></li>';
    	return s;
    }
    
    // 进行中无库存
    function getHtml2(obj){
    	var s = '<li>'+
        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="selling_item over external" data-transition="slide-in">'+
            '<div class="selling_pic">'+
                '<img src='+obj.ImageUrl+'>'+
            '</div>'+
            '<div class="selling_text">'+
                '<div class="selling_title">'+obj.showName+'</div>'+
                '<div class="price_detail">'+
                    '<div class="price_one">'+
                        '<p class="change_price">'+
                            '<span>换购价</span>'+
                            '<span class="change_span">&yen;'+(obj.salePrice/100)+'</span>'+
                            '<s>&yen;'+(obj.purchasePrice/100)+'</s>'+
                        '</p>'+
						'<p class="progress" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'" stype="background:rgba(0,0,0,0.25)">' +
							'<span class="span_f" stype="width:0"></span>' +
							'<span class="span_s">剩余<span>0</span>个</span>' +
						'</p>'+
                    '</div>'+
                    '<div class="go_change">立即换购</div></div></div></a></li>';
        return s;    
    }

	function getPercent(total, stock){
		if (total == 0)
			return 1;
		return stock/total;
	}
});
