// 判断当前加载中是否打开着
var isIndicator = false;
var arrDetailInfo = null;
var grouponId = xhq.getQuery("grouponId");
var status = 1;
var endArr=[];

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

//显示截止时间倒计时
function showEndTime(){
	//获取当前时间  
    var date = new Date();  
    var now = date.getTime(); 
	for (var i = 0; i < endArr.length; i++) {
		var _tmp = endArr[i];
		// 从s中截取得到groupId和截止时间
		var _tmpStart = _tmp.indexOf('=');
        var _k = _tmp.substr(0, _tmpStart); //这是gid
        var _v = _tmp.substr(_tmpStart + 1); // 这是endtime
		//时间差  
	    var leftTime = _v - now;  
	    //定义变量 h,m,s保存倒计时的时间  
	    var d,h,m,s;  
	    var str;
	    //console.log('time='+leftTime);
	    if (leftTime>=0) {  
	        d = Math.floor(leftTime/1000/60/60/24);  
	        h = Math.floor(leftTime/1000/60/60%24);  
	        m = Math.floor(leftTime/1000/60%60);  
	        s = Math.floor(leftTime/1000%60);
	        h = h>=0 && h<=9 ? '0'+h : h;
	        m = m>=0 && m<=9 ? '0'+m : m;
	        s = s>=0 && s<=9 ? '0'+s : s;
	        str = '剩余'+h+":"+m+":"+s+'结束';
	    }else{
	    	str = '此拼团已结束';
	    	$('nav1').hide();
	    	$('nav2').show();
	    }
	    
	    $("#timeEnd_"+_k).html(str);
	}
}

function setBuyNowLocalSession(arrDetailInfo){
	setLocalSession('localOrderSession', null);
	var shoppingCart;
	if (arrDetailInfo != null){
		var row = getBuyJSON(arrDetailInfo);
		var body = new Array();
		row.num = 1;
		body[0] = row;
		shoppingCart = body;
		
		var json = JSON.stringify(shoppingCart);
		setLocalSession('localOrderSession', json);
		console.log('LocalSession=' + getLocalSession('localOrderSession'));
	}
}

function gotoOrder(groupId){
	var object = arrDetailInfo;
	object.salePrice = arrDetailInfo.grouponPrice;
	setBuyNowLocalSession(object);
	var params = groupId ? {mailType:'lkgm','channelType':4,'sourceType':4,'groupId':groupId} : {mailType:'lkgm','channelType':5,'sourceType':4};
	xhq.gotoUrl("order.html",params); //mallType 代表从下单进入
}

$(function () {
	// 获取传入的开团ID参数
	
	if (! grouponId){
		$.toast("系统异常，缺少团号");
		return;
	}
	
    // 1 开始
	openIndicator();
	
	// 开始加载商品数据
	var param={interId:'toc.getGrouponShareDetail',channel:'C',grouponId:grouponId};
	xhq.__runXHQ(param, function(data){
		hideIndicator();
		if (data.status == 0){
			console.log('toc.getOnlineDetail='+JSON.stringify(data));
			var body = data.body;
			arrDetailInfo = body;
			setData(data);
		}else{
			$.toast(data.message);
		}	
	});
	
	// 填充数据
	function setData(data){
		if (!data.body) return;
		// 轮播图
		showSwiper(data.body.images);
		$("#grouponNum").html(data.body.grouponNum || 0);
		$("#groupPrice").html((data.body.grouponPrice || 0)/100);
		$("#purchasePrice").html((data.body.purchasePrice || 0)/100);
		$("#salesVolume").html((data.body.salesVolume || 0));
		$(".goods_text").html((data.body.showName || ""));
		$(".goods_bri").html((data.body.conduct || ""));
		
		// 动态生成mid_box中的内容
		var html='<div class="pic_box">';
		if (data.body.groupons || data.body.groupons.length>0){
			for (var i = 0; i < data.body.groupons.length; i ++){
				var en = data.body.groupons[i];
				if (en.isOwner == 1 && i == 0){
					html += '<div class="tourer"><img src='+en.headimgUrl+' alt=""><span>团长</span></div>';
				}else{
					html += '<div class="toured"><img src='+en.headimgUrl+' alt=""></div>';
				}
			}
		}

		
		var wwcsl = ((data.body.grouponNum || 0) - (data.body.realNum || 0));
		if (wwcsl < 0) wwcsl = 0;
		if (wwcsl > 0){
			for (var i = 0; i < wwcsl; i ++){
				html += '<div class="toured unknow"><img src="../img/unknow.png" alt=""></div>';
			}
		}
		html+="</div>";
		
		status = data.body.status;
		// 处理剩余时间和名额
		if (status==1){
			html +='<div class="text_box none">仅剩<span class="span_f">'+wwcsl+'</span>个名额<br><span class="span_s" id="timeEnd_'+grouponId+'"></span></div>';
			$(".mid_box").html(html);
			
			var time = data.body.endTime;
			time=time.replace(/-/g,':').replace(' ',':');
			time=time.split(':');
			var endDate = new Date(time[0],(time[1]-1),time[2],time[3],time[4],time[5]);
			endArr.push(grouponId+"="+endDate.getTime());
			showEndTime();
			setInterval(showEndTime,1000);
		}else{
			html +='<div class="text_box none">仅剩<span class="span_f">'+wwcsl+'</span>个名额<br>此拼团已结束 </div>';
			$(".mid_box").html(html);
			$("#nav1").css("display","none");
			$("#nav2").css("display","block");
		}
		
		// 微信分享设置
		shareTitle = '我买了'+((data.body.grouponPrice || 0)/100)+'元 '+data.body.showName;
		shareIcon=data.body.bigPic;
		shareIcon = shareIcon.trim();
		shareUrl=xhq.getDomainUrl()+"tour_goods_share.html?grouponId="+grouponId+"&"+xhq.getVersion();
		shareConfig={
			    title: shareTitle, 
			    desc: '【还差'+wwcsl+'人】'+data.body.conduct,
			    link: shareUrl,
			    imgUrl: shareIcon
			};
		
		xhq.initWXJsConfig();
	}
	
	function showSwiper(val){
		if (!val) return;
		var arrImages = val.split(',');
		if (!arrImages || arrImages.length < 1) return;
		
		var swiperHtml="";
		for(var j in arrImages){
			swiperHtml += '<div class="swiper-slide"><img src="'+arrImages[j]+'" alt=""></div>';
		}	
		$("#sw_data").html(swiperHtml);
		
		if (arrImages.lenght>1){
			var swiper = new Swiper('.swiper-container', {
				pagination: '.swiper-pagination',
				paginationClickable: true,
				spaceBetween: 30,
				centeredSlides: true,
				autoplay: 2500,
				autoplayDisableOnInteraction: false
			});
		}
	}
	
	$("#toMore").tap(function(){
		xhq.gotoUrl("tour.html");
	})
	$("#toMore2").tap(function(){
		xhq.gotoUrl("tour.html");
	})
	// 点击加入到购物车数量增加
	$('.go_tour').on('tap',function(){
		if (status == 1){
			gotoOrder(grouponId);
		}
	});
	
	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);	
		wx.onMenuShareTimeline(shareConfig);
    });
});