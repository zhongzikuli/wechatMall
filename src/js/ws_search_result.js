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
	// 如果是从微信菜单直接进入，且当前人员角色不是微商，则直接引导到注册页面
	if (getLocalSession("userType") != 2){
		$.alert('亲，您尚未注册成为全民集市的店长，请先注册', '温馨提醒', function () {
			xhq.gotoRegUrl();
			return;
        });
	}
	
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
		xhq.gotoUrl("search_record.html",{keyword:keyword,isWs:1});
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
		var param={interId:'toc.getGoodsOnline',channel:'C',typeId:typeId,primeTypeId:primeTypeId,keyword:keyword,sortType:sortType,filter:2,pageNo:pageNo,pageSize:pageSize,topTypeName:topTypeName,isWs:1,custId:getLocalSession("custId")};
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
				if (obj.isOnline && obj.isOnline > 0){
					html = html + getHtml2(obj);
				}else{
					html = html + getHtml1(obj);
				}
			} 
			if (pageNo == 1)
				$(".content-block .list_container").html(html);
			else
				$(".content-block .list_container").append(html);
		}
	}

	// 已添加到店铺
	function getHtml1(obj) {
		var s = '<li class="ws_li">'+
					'<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external" data-transition="slide-in">'+
					'<div class="selling_pic"><img src='+obj.ImageUrl+'></div>'+
					'<div class="selling_text">'+
						'<div class="selling_title">'+obj.showName+'</div>'+
						'<div class="selling_price">'+
							'<div class="pri_l">';
		if (obj.purchasePrice && obj.purchasePrice>0){
			s += '<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s>¥<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>';
		}else{
			s += '<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s><span class="pri_two"></span></s></p>';
		}

							s+='</div>'+
							'<div class="pri_r">赚: ¥<span>'+(obj.bonus/100)+'</span></div>'+
						'</div>'+
						'<div class="go_buy">'+
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

						s+='</div>'+
					'</div>'+
				'</a>'+
				'<div class="sur_r uptoshop" data_id='+obj.onlineId+'><img src="../img/icon_shi.png" alt=""></div>'+
			'</li>';
		return s;
	}

	// 已上架
	function getHtml2(obj) {
		var s = '<li class="lied">'+
			'<a href="goods_detail.html?onlineId='+obj.onlineId+'&'+xhq.getVersion()+'" class="item-link list-button external" data-transition="slide-in">'+
				'<div class="selling_pic"><img src='+obj.ImageUrl+'></div>'+
				'<div class="selling_text">'+
					'<div class="selling_title">'+obj.showName+'</div>'+
					'<div class="selling_price">'+
						'<div class="pri_l">';
		if (obj.purchasePrice && obj.purchasePrice>0){
			s += '<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s>¥<span class="pri_two">'+(obj.purchasePrice/100)+'</span></s></p>';
		}else{
			s += '<p>¥<span class="pri_one">'+(obj.salePrice/100)+'</span><s><span class="pri_two"></span></s></p>';
		}
						s+='</div>'+
						'<div class="pri_r">赚: ¥<span>'+(obj.bonus/100)+'</span></div>'+
					'</div>'+
					'<div class="go_buy">'+
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
					s += '</div>'+
				'</div>'+
			'</a>'+
			'<div class="sur_r">已添加</div>'+
		'</li>';
		return s;
	}
	
	
	function getPercent(total, stock){
		if (total == 0)
			return 1;
		return stock/total;
	}
	
	$(".list_container").on('tap', 'li .uptoshop',function(){
    	var obj = $(this);
		var onlineId = $(this).attr("data_id");
		var param={interId:'toc.custUpOnline',channel:'C',custId:getLocalSession("custId"),onlineId:onlineId};
		$.showIndicator();
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				// 修改为已添加
				obj.removeClass("uptoshop");
				obj.parent().removeClass("ws_li");
				obj.parent().addClass("lied");
				obj.html("已添加");
				$.toast("上架成功");
			}else{
				$.toast(data.message);
			}
		});
	})
});
