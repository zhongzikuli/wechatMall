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
	// 1 开始处理轮播图
	openIndicator();

	// 开始加载商品数据
	loadData();

	function loadData() {
		// 从页面打开的参数中取得actId参数
		var param = { interId: 'toc.getBannerDetail', channel: 'C', actId: xhq.getQuery("actId") };
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
	function setData(data) {
		var html = "";

		if(data.body.goods != undefined && data.body.goods != null && data.body.goods.length > 0) {
			for(var i = 0; i < data.body.goods.length; i++) {
				var obj = data.body.goods[i];
				if(obj.purchasePrice > 0) {
					html = html + getSaleHtml1(obj);
				} else {
					html = html + getNormalHtml2(obj);
				}
			}
			$(".content .list_container").append(html);
		}
	}

	// 特卖商品
	function getSaleHtml1(obj) {
		var s = '<li>' +
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
								 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									 '<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>';
							 }else if (per >0.9&&per<1){
								s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
										'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>';
							}else{
								s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
										'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' ;
							}
								s+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>' +
									'<div class="sur_r">立即抢<img src="../img/icoJiantou1.png"></div>'+
						'</div>'+
					'</div>'+
				'</a>'+
			'</li>';
		return s;
	}

	// 非特卖商品
	function getNormalHtml2(obj) {
		var s = '<li>'+
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
							 s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
								 '<span class="span_f" style="width:4.5rem;border-radius: 8px"></span>';
						 }else if (per >0.9&&per<1){
							s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									'<span class="span_f" style="width:4.05rem;border-radius: 8px 0 0 8px"></span>';
						}else{
							s+='<p class="surplus" status="'+obj.status+'" totalStock="'+obj.totalStock+'" stock="'+obj.stock+'">' +
									'<span class="span_f" style="width:'+4.5*per+'rem;border-radius: 8px 0 0 8px" ></span>' ;
						}
							s+='<span class="span_s">剩余<span>'+obj.stock+'</span>个</span></p></div>' +
								'<div class="sur_r">立即抢<img src="../img/icoJiantou1.png"></div>'+
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
});