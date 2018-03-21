function openIndicator(){
	$.showIndicator();
	isIndicator = true;
}

function hideIndicator(){
	if(isIndicator){
		$.hideIndicator();
		isIndicator = false;
	}
	loading = false;
}

var HTML_HEAD = "" +
	"<head><meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'/>" +
	"<style type=\"text/css\">\n" +
	"\t   body{padding:0;margin:0}" +
	"\t   img{width:100%}" +
	"\t.detail_intro{\n" +
	"\t    font-size: 12px;\n" +
	"\t    color: #5A5A5A;\n" +
	"\t    overflow-x: hidden;\n" +
	"\t    font-family: 'microsoft yahei', Verdana, Arial, Helvetica, sans-serif;\n" +
	"\t}\n" +
	"\t.detail_intro table{\n" +
	"\t    border-spacing: 0px;\n" +
	"\t    border-collapse: collapse;\n" +
	"\t    font-size:16px;color:#5A5A5A;\n" +
	"\t    font-family:'microsoft yahei', Verdana, Arial, Helvetica, sans-serif;\n" +
	"\t    margin:0px;\n" +
	"\t    padding:0px;\n" +
	"\t    width: 100%!important;\n" +
	"\t    background:#fff!important\n" +
	"\t}\n" +
	"\t.detail_intro td {\n" +
	"\t    height: 10px;\n" +
	"\t    padding: 0 5px;\n" +
	"\t    line-height: 20px;\n" +
	"\t    font-size: 12px;\n" +
	"\t    color: #333;\n" +
	"\t    word-break: break-all;\n" +
	"\t    border:1px solid #000!important;\n" +
	"\t    background: #fff!important;\n" +
	"\t}\n" +
	"\t.detail_intro tr td:first-child{\n" +
	"\t    text-align: center;\n" +
	"\t    width: 130px;\n" +
	"\t}\n" +
	"</style></head><body><div class=\"detail_intro\">";
var HTML_END = "</div>";

$(function() {
	// 如果是从微信菜单直接进入，且当前人员角色不是微商，则直接引导到注册页面
	if (getLocalSession("userType") != 2){
		$.alert('亲，您尚未注册成为全民集市的店长，请先注册', '温馨提醒', function () {
			xhq.gotoRegUrl();
			return;
        });
	}
	
	// 1 开始处理轮播图
	openIndicator();

	// 开始加载商品数据
	loadData();

	function loadData() {
		// 从页面打开的参数中取得actId参数
		var param = { interId: 'toc.getBannerDetail', channel: 'C', actId: xhq.getQuery("actId"),isWs:1,custId:getLocalSession("custId") };
		xhq.__runXHQ(param, function(data) {
			if(data.status == 0) {
				if(data.body != null && data.body != undefined) {
					$("#actContent").append(HTML_HEAD + data.body.content || "" + HTML_END);
					setData(data);
				}
			} else {
				hideIndicator();
				$.toast(data.message);
			}
			hideIndicator();
		});
	}

	// 填充数据：mode=1覆盖  mode=2追回
	function setData(data){
		var html = "";

		if(data.body.goods != undefined && data.body.goods != null && data.body.goods.length > 0) {
			for(var i = 0; i < data.body.goods.length; i++) {
				var obj = data.body.goods[i];
				if(obj.isOnline > 0) {
					html = html + getHtml2(obj);
				} else {
					html = html + getHtml1(obj);
				}
			}
			$(".content .list_container").append(html);
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