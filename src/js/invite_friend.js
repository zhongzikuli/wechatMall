var custId=getLocalSession("custId");
var userType=getLocalSession("userType");

var shareConfig={};
var shareTitle = (getLocalSession("nickName")||"")+"邀请你在全民集市开店";
var shareIcon = getLocalSession("headimgUrl")||DEFAULT_HEADIMG;
var shareUrl=xhq.getDomainUrl()+"selfreg2.html?fromCustId="+custId+"&"+xhq.getVersion();
var shareConfig={
	    title: shareTitle, 
	    desc: "全民集市，特卖好货。自买返利，分享赚钱。成为会员更有多种福利等着你",
	    link: shareUrl,
	    imgUrl: shareIcon
	};
$(function () {
	if (custId == 0 || userType != 2){
		xhq.gotoRegUrl();
		return;
	}
	
	// 处理好友数量
	var param={interId:'toc.getCustChildsNumber',channel:'C',custId:custId};
	xhq.__runXHQ(param, function(data){
		// 检测返回值
		if (data.status == 0){
			if (data.body != null && data.body != undefined && data.body.nums != null && data.body.nums != undefined){
				var nums = data.body.nums || 0;
				if (nums == 0){
					var top_boxHtml = '还未邀请到好友开店哦';
					$('.top_box').html(top_boxHtml);
				}else{
					var top_boxHtml = '已邀请到<span>'+nums+'个</span> 好友开店';
					$('.top_box').html(top_boxHtml);
				}
			}else{
				var top_boxHtml = '还未邀请到好友开店哦';
				$('.top_box').html(top_boxHtml);
			}
			
		}else{
			$.toast(data.message);
		}
	});
	
	xhq.initWXJsConfig();
	
	wx.ready(function () {
		wx.onMenuShareAppMessage(shareConfig);	
		wx.onMenuShareTimeline(shareConfig);
    });
	
	$("#inviteCode").html(getLocalSession("inviteCode") || "您尚无邀请码");
});