var arrDetailInfo = null;
var custId = getLocalSession("custId") || 0;
var endArr=[];

//微信分享相关
var shareConfig={};
var shareTitle;
var shareIcon;
var shareUrl;

//显示截止时间倒计时
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
	    //console.log(_tmp+' '+_v+' '+leftTime);
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
	    	$("#gogroup_"+_k).css('background','rgb(180,180,180)');
	    	$("#gogroup_"+_k).attr('onclick','').unbind('click');
	    }
	    $("#timeEnd_"+_k).html(str);
	}
}

function addElement(data){
	var detail = data.body;
	var list = detail.groupons;
	var onlineId = detail.onlineId;
	var arrStatus = new Array();
	arrStatus[1] = '进行中';
	arrStatus[2] = '已售完';
	var status = detail.status != undefined && detail.status != null ? detail.status : 1;
	$('#status').val(status);
	var textStatus = arrStatus[status];
	
	var showName = detail.showName != undefined && detail.showName != null ? detail.showName : '';
	var purchasePrice = detail.purchasePrice != undefined && detail.purchasePrice != null ? detail.purchasePrice/100 : '';
	var salePrice = detail.salePrice != undefined && detail.salePrice != null ? detail.salePrice/100 : '';
	var grouponPrice = detail.grouponPrice != undefined && detail.grouponPrice != null ? detail.grouponPrice/100 : '';
	var grouponNum = detail.grouponNum != undefined && detail.grouponNum != null ? detail.grouponNum : 0;
	var conduct = detail.conduct != undefined && detail.conduct != null ? detail.conduct : '';
	var description = detail.description != undefined && detail.description != null ? editHTML(detail.description) : '';
	var maintainDesction = detail.maintainDesction != undefined && detail.maintainDesction != null ? editHTML(detail.maintainDesction) : '';
	var specDescription = detail.specDescription != undefined && detail.specDescription != null ? editHTML(detail.specDescription) : '';
	var images = detail.images != undefined && detail.images != null ? detail.images : '';
	var salesVolume = detail.salesVolume != undefined && detail.salesVolume != null ? detail.salesVolume : 0;
	// 配置轮播图
	if (images.trim() != ''){
		var arrImages = images.split(',');
		if (arrImages.length>0){
			var swiperHtml = '<div class="swiper-wrapper">';
			if (arrImages.length){
				for(var j in arrImages){
					swiperHtml += '<div class="swiper-slide"><img src="'+arrImages[j]+'" alt=""></div>';
				}	
			}
			swiperHtml += '</div>'+
			'<div class="swiper-pagination"></div>';
			$('.swiper-container').html(swiperHtml);
			
			if (arrImages.length>1){
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
	}
	
	//配置商品名称
	$('.goods_detail').html('<div class="tour_num"><span>'+grouponNum+'</span>人团</div>'+
    '<div class="tour_pri">'+
        '<span class="pri_one">&yen;<span>'+salePrice+'</span></span>'+
        '<s class="pri_two">&yen;<span>'+purchasePrice+'</span></s>'+
    '</div>'+
    '<div class="tour_bri">累计销量：<span>'+salesVolume+'</span>件</div>');
	$('.goods_text').html(showName);
	$('.goods_bri').html(conduct);
	$('#grouponNum').html((grouponNum > 1 ? grouponNum - 1 : 0));
	
	//配置参团列表
	var strList = '';
	var count = 0;
	if (list != null){
		for(var v in list){
			k = list[v];
			grouponId = k.grouponId;
			nickName = k.nickName;
			headimgUrl = k.headimgUrl;
			city = k.city;
			remainNum = k.remainNum;
			endTime = k.endTIme;
			
			var time = endTime;
			time=time.replace(/-/g,':').replace(' ',':');
			time=time.split(':');
			var endDate = new Date(time[0],(time[1]-1),time[2],time[3],time[4],time[5]);
			var nicknameTxt = nickName.length > 6 ? nickName.substr(0,6)+'...' : nickName;
			endArr.push(grouponId+"="+endDate.getTime());
			strList += '<div class="box_info">'+
		    '<div class="box_pic"><img src="'+headimgUrl+'" alt=""></div>'+
		    '<div class="box_name">'+
		        '<div class="name_l">'+
		            '<p class="name">'+nicknameTxt+'</p>'+
		            '<span class="city">'+city+'</span>'+
		        '</div>'+
		        '<div class="name_r">'+
		            '<span class="num">还差<span>'+remainNum+'</span>人成团</span><br>'+
		            '<span class="time" id="timeEnd_'+grouponId+'"></span>'+
		        '</div>'+
		    '</div>'+
		    '<div class="box_go" id="gogroup_'+grouponId+'" onclick="gotoOrder('+grouponId+', 4)">去参团</div>'+ 
		    '</div>'; //参团
			count++;
		}
	}
	$('.down_box').html(strList);
	
	if (list != null && list.length>0){
		showEndTime();
		setInterval(showEndTime,1000);
	}

	if (!count){
		$('.tip_two').hide();
		$('.tip_box').find('hr').hide();
	}
	
	//配置按钮
	$('.pri_thr').html('&yen;<span>'+salePrice+'</span>');
	$('.pri_one').html('&yen;<span>'+grouponPrice+'</span>');
	$('.pri_beg_group').html('<span>'+grouponNum+'</span>人团');
	
	$('#text_one').find('.content-block').html(description);
	$('#text_two').find('.content-block').html(specDescription);
	$('#text_three').find('.content-block').html(maintainDesction);
	$('.test-lazyload').picLazyLoad({ threshold: 100});

	if (status != 1){
		
		$('.buy_now').css('background','rgb(156,156,156)');
		$('.add_cart').css('background','rgb(180,180,180)');
		$('.box_go').css('background','rgb(180,180,180)');
	}
     
}

function getDetail(onlineId, custId){
	//alert(onlineId);
	if (onlineId != undefined && custId != undefined && onlineId != null && custId != null){
		var param={'interId':'toc.getGrouponDetail','channel':'C','onlineId':onlineId,'custId':custId};
		xhq.__runXHQ(param, function(data){
			// 检测返回值
			//alert(JSON.stringify(data));
			console.log('toc.getOnlineDetail='+JSON.stringify(data));
			if (data.status == 0){
				var body = data.body;
				arrDetailInfo = body;
				addElement(data);
				
				// 微信分享设置
				shareTitle = ((data.body.grouponPrice || 0)/100)+'元 '+ data.body.showName;
				shareIcon=data.body.bigPic;
				shareIcon = shareIcon.trim();
				shareUrl=xhq.getDomainUrl()+"tour_goods_detail.html?online_id="+onlineId+"&"+xhq.getVersion();
				shareConfig={
					    title: shareTitle, 
					    desc: data.body.conduct,
					    link: shareUrl,
					    imgUrl: shareIcon
					};
				xhq.initWXJsConfig();
			}else{
				$.toast(data.message);
			}
		});
	}
}

function setBuyNowLocalSession(arrDetailInfo){
	setLocalSession('localOrderSession', null);
	var shoppingCart;
	if (arrDetailInfo != null){
		var row = getBuyJSON(arrDetailInfo);
		var body = new Array();
		row.num = $('#num_handle').val();
		body[0] = row;
		shoppingCart = body;
		
		var json = JSON.stringify(shoppingCart);
		setLocalSession('localOrderSession', json);
		console.log('LocalSession=' + getLocalSession('localOrderSession'));
	}
}

function gotoOrder(groupId, channelType){
	if ($('#status').val() == 1){
		var object = arrDetailInfo;
		object.salePrice = channelType == 1 ? arrDetailInfo.salePrice : arrDetailInfo.grouponPrice;
		setBuyNowLocalSession(object);
		
		if (groupId){
			params = {mailType:'lkgm','channelType':4,'sourceType':4,'groupId':groupId};
		}else{
			params = channelType == 5 ? {mailType:'lkgm','channelType':5,'sourceType':4} : {mailType:'lkgm','channelType':1,'sourceType':3};
		}
		xhq.gotoUrl("order.html",params); //mallType 代表从下单进入
	}
}

$(function () {

	var onlineId = getUrlParam('online_id');
	onlineId = parseInt(onlineId);
	getDetail(onlineId, custId);
	
	// 商品数量增加
	$(".add").on('tap',function(){
	         var input_num = $('.num_handle');
	         input_num.val(parseInt(input_num.val())+1);
	});
	// 商品数量减少
	$(".subtract").on('tap',function() {
		var input_num = $('.num_handle');
        input_num.val(parseInt(input_num.val()) - 1);
        if (parseInt(input_num.val()) < 1) {
            input_num.val(1);
        }
    });

    // 点击弹出拼团规则
    $(document).on('click','.alert-text',function () {
    	var rules = '<p align="left">1 拼团人数：“全民集市”针对不同的商品，直接显示“2人团”，“3人团”，“5人团”等开团标准，发起团购后，只要参与者大于等于当前商品所规定的拼团人数，就可以拼团成功。</p>'+
    		'<p align="left">2 拼团时间：时间限定为24小时，如果24小时内拉不到足够的人数，则此次拼团失效。</p>'+
    		'<p align="left">3 在发起拼团24小时期间，如果在人数没达到最小人数之前，商品提前售罄，则此次拼团失效。</p>'+
    		'<p align="left">4 关于退款：对于失效的拼团订单，我们会将参与者所付款退回其指定账户中。';
        $.alert(rules, '温馨提示');
    });
	
	// 单独购买
	$('.add_cart').on('tap',function(){
		gotoOrder(0,1);
	});
	
	// 开团
	$('.buy_now').on('tap',function(){
		gotoOrder(0,5);
	});
	
	$('.tohome').on('tap',function(){
		if (xhq.getQuery("isWs") == 1)
			xhq.gotoUrl("ws_home.html");
		else
			xhq.gotoUrl("home.html");
	});
	
	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);	
		wx.onMenuShareTimeline(shareConfig);
    });
});
//$.init()
