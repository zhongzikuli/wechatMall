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

function showNoDataPage() {
	$("#content-block1").hide();
	$("#content-block2").show();
}

var fromCustId =0;
$(function () {
	fromCustId = xhq.getQuery("fromCustId");

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
	
	// 开始加载商品数据
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.custOnlineList',channel:'C', fromCustId:fromCustId,pageNo:pageNo,pageSize:pageSize};
		xhq.__runXHQ(param, function(data){
			hideIndicator();
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (! data.body || !data.body.datas ||  data.body.datas.length<pageSize){
					$.detachInfiniteScroll($content);
					$('.infinite-scroll-preloader').remove();
				}
				if (pageNo == 1 && (!data.body == null || !data.body.datas || !data.body.datas.length)){
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
		$("#input_image").attr("src", data.body.headimgUrl || DEFAULT_HEADIMG);
		$("#input_level").html(data.body.level || '店长');
		$("#input_sname").html((data.body.nickName||'') +"的店铺");
		
		var html = "";
		if (data.body && data.body.datas && data.body.datas.length > 0){
			for(var i=0; i<data.body.datas.length; i++){ 
				var obj = data.body.datas[i];
				if (obj.status == 1){
					html = html + getHtml1(obj);
				}else if (obj.status == 2 || obj.status == 4){
					html = html + getHtml2(obj);
				}else{
					html = html + getHtml3(obj);
				}
			}
			$(".content-block .list_container").append(html);
		}
	}
   
	// 进行中
	function getHtml1(obj){
		var s = '<li>'+
	        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
	            '<div class="li_l">'+
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
	                    '<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
	                '</div>'+
	                '<div class="down_con">'+
	                    '<div class="sur_l">';
	                   
	                   if (obj.stock <= 0){
	           			s += '<p class="surplus">'+
	                       	'<span class="span_f"></span>'+
	                       	'<span class="span_s">剩余<span>0</span>个</span>'+
	                       	'</p></div>';
	           		}else{
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
	           			s+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>';
	           		}
	                    s+='<div class="sur_a">立即抢<img src="../img/icoJiantou1.png"></div>'+
	                '</div>'+
	            '</div>'+
	        '</a>'+
	    '</li>';
		
	    return s;
	}
	
	// 已结束
	function getHtml2(obj){
		var s= '<li class="over">'+
	        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
	            '<div class="li_l">'+
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
	                    '<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
	                '</div>'+
	                '<div class="down_con">'+
	                    '<div class="sur_l">'+
	                        '<p class="surplus">'+
	                            '<span class="span_f"></span>'+
	                            '<span class="span_s">剩余<span>0</span>个</span>'+
	                        '</p >'+
	                    '</div>'+
	                    '<div class="sur_a">已抢完<img src="../img/icoJiantou1.png"></div>'+
	                '</div>'+
	            '</div>'+
	        '</a>'+
	    '</li>';
		return s;
	}
	
	// 未开始
	function getHtml3(obj){
		var s = '<li class="waiting">'+
	        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external">'+
	            '<div class="li_l">'+
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
	            	                    '<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
	                '</div>'+
	                '<div class="down_con">'+
	                    '<div class="sur_l">'+
	                        '<p class="surplus">'+
	                            '<span class="span_f"></span>'+
	                            '<span class="span_s">剩余<span>'+obj.stock+'</span>个</span>'+
	                        '</p >'+
	                    '</div>'+
	                    '<div class="sur_a">未开始<img src="../img/icoJiantou1.png"></div>'+
	                '</div>'+
	            '</div>'+
	        '</a>'+
	    '</li>';
		return s;
	}
	
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
    $("#tohome").on("tap",function(){
    	xhq.gotoUrl("home.html");
    })
});
