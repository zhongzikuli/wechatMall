// 全局变量
var pageNo=0;
var pageSize=20;

//判断当前加载中是否打开着
var isIndicator = false;

// 刷新相关
var $content = null;
var loading = false;
var sortType=1;

// tab切换相关
var preTabId = $("#tab_zh").attr("id");;

// 页面打开条件
var typeId=0;
var typeName="";
var topTypeName="";
var keyword="";
var primeTypeId=0;

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

function showNoDataPage(){
	$("#showdiv1").css("display","none");
	$("#showdiv2").css("display","block");
}

function saveKeyword(s){
	var lastStr = getLocalSession("search_records") || "";
	var last = [];
	if (lastStr != "")
		last = lastStr.split("|");
	// 处理搜索内容的缓存 如果last中有刚搜索的记录则不处理，否则追加到数组的最前面
	var exist = 0;
	for(var i=0;i<last.length;i++){
		if (last[i] == s){
			exist = 1;
			break;
		}
	}
	if (exist){
		return;
	}
	
	var newArr = [];
	newArr[0] = s;
	for(var i=0;i<last.length;i++){
		if (i + 1 > 9)
			break;
		newArr[i+1] = last[i];
	}
	
	setLocalSession("search_records", newArr.join("|"));
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
		        loadData();
		        $.refreshScroller();
		    }, 1000);
		});
	});
	
	// 注册tab切换事件
	$(".tab-link").on('click',function(e){
		var curtabid = $(this).attr("id");
		var reload = 0;
		if (curtabid != preTabId){
			// tab切换了，需要重新加载
			if (curtabid == "tab_zh")
				sortType = 1;
			else if (curtabid == "tab_xl")
				sortType = 2;
			else if (curtabid == "tab_fh")
				sortType = 3;
			else{
				sortType = 4;
			}
			reload = 1;
			
			$("#"+preTabId).removeClass("active")
			$(this).addClass("active");
			preTabId = curtabid;
		}else{
			if (curtabid == "tab_jg"){
				if (sortType == 4)
					sortType = 5;
				else
					sortType = 4;
				reload = 1;
			}
		}
		if (reload == 1){
			openIndicator();
			pageNo=0;
			loadData();
			// 重新绑定上拉加载
			$.attachInfiniteScroll($content);
			$('.infinite-scroll-preloader').css("display","block");
		}
	});
	
	$("#search_goods").on('tap',function(){
		xhq.gotoUrl("search_record.html",{keyword:keyword});
	});
	
	$.init();  
	
    // 1 开始处理轮播图
	openIndicator();
	
	// 初始化页面打开时的条件
	typeId=xhq.getQuery("typeId");
	primeTypeId = xhq.getQuery("primeTypeId");
	typeName=xhq.getQuery("typeName") || "";
	keyword=xhq.getQuery("keyword") || "";
	topTypeName=xhq.getQuery("topTypeName") || "";
	if (keyword != ""){
		$("#search_goods").val(keyword);
		saveKeyword(keyword);
	}else {
		if (typeName != "")
			$("#search_goods").val(typeName);
		else if (topTypeName != "")
			$("#search_goods").val(topTypeName);
	}
	
	// 开始加载商品数据
	loadData();
	
	function loadData(){
		pageNo = pageNo + 1;
		var param={interId:'toc.getGoodsOnline',channel:'C',typeId:typeId,primeTypeId:primeTypeId,keyword:keyword,sortType:sortType,filter:2,pageNo:pageNo,pageSize:pageSize,topTypeName:topTypeName};
		xhq.__runXHQ(param, function(data){
			if (data.status == 0){
				setData(data);
				// 当数据已全部加载完成，则不允许上拉加载
				if (data.body == null || data.body.length<pageSize){
					$.detachInfiniteScroll($content);
					$('.infinite-scroll-preloader').css("display","none");
				}
				if (pageNo == 1 && (!data.body || !data.body.length)){
					showNoDataPage();
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
				if (obj.isSale ==1){
					html = html + getSaleHtml1(obj);
				}else{
					html = html + getNormalHtml2(obj);
				}
			} 
			if (pageNo == 1)
				$(".content-block .list_container").html(html);
			else
				$(".content-block .list_container").append(html);
		}
	}

	function getSaleHtml1(obj){
		var html = '<li>' +
					'<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external" data-transition="slide-in">'+
		            		'<div class="selling_pic">'+
		            			'<img src='+obj.ImageUrl+'>'+				            
				        '</div>'+
			            '<div class="selling_text">'+
			                '<div class="selling_title">'+obj.showName+'</div>'+
			                '<div class="selling_price">'+
			                   '<div class="pri_l">'+
									'<p>&yen;<span class="pri_one">'+(obj.salePrice/100)+'</span>'+
										'<s>&yen;<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s>'+
									'</p>'+
								'</div>'+
								'<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+	
							'</div>'+
							'<div class="go_buy">'+
								'<div class="sur_l">';
							
						var per =  getPercent(obj.totalStock,obj.stock);
							 if(per==1){
								 html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									 '<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>';
							 }else if (per >0.9&&per<1){
								html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
										'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>';
							}else{
								html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
										'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' ;
							}
								html+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>' +
									'<div class="sur_r">立即抢<img src="../img/icoJiantou1.png"></div>'+
						'</div>'+
					'</div>'+
				'</a>'+
			'</li>';
						
		return html;
	}
	
	function getNormalHtml2(obj){
		var html = '<li>'+
	        '<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external" data-transition="slide-in">'+
	            '<div class="selling_pic">'+
	                '<img src='+obj.ImageUrl+'>'+
	            '</div>'+
	            '<div class="selling_text">'+
	                '<div class="selling_title">'+obj.showName+'</div>'+
	                '<div class="selling_price">'+
		                '<div class="pri_l">'+
								'<p>&yen;<span class="pri_one">'+(obj.salePrice/100)+'</span>'+
										'<s><span class="pri_two"></span></s>'+
								'</p>'+
						'</div>'+
						'<div class="pri_r">送积分:<span>'+(obj.money)+'</span></div>'+
					'</div>'+
					'<div class="go_buy">'+
						'<div class="sur_l">';
						
					var per =  getPercent(obj.totalStock,obj.stock);
						 if(per==1){
							 html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
								 '<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>';
						 }else if (per >0.9&&per<1){
							html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>';
						}else{
							html+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' ;
						}
							html+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>' +
								'<div class="sur_r">立即抢<img src="../img/icoJiantou1.png"></div>'+
					'</div>'+
				'</div>'+
			'</a>'+
		'</li>';
		
		return html;
	};
	
	
	function getPercent(total, stock){
		if (total == 0)
			return 1;
		return stock/total;
	}
});
