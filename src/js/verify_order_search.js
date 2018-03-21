
$(function () {
	    
	   $('#startTime').val(getNowFormatDate())
	   $('#endTime').val(getNowFormatDate())
		var orgId = getLocalSession("orgId")||"";//4
		var opPhone = getLocalSession("opPhone")||"";//15258883811
		if(orgId==""||opPhone==""){
			xhq.gotoUrl('../html/verify_login.html',{type:2})
			return;
		}else{
			$.showIndicator();
			var param={interId:'toc.orgInfoByopPhone',phoneNo:opPhone};
			xhq.__runXHQ(param, function(data){
				$.hideIndicator();
				if (data.status == 2 || data.status == 1){
					xhq.gotoUrl('../html/verify_login.html',{type:2})
				}
			});
		}
})

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

$(".btn_box").on('click',function(){
	var orgId = getLocalSession("orgId");
	var startTime = $('#startTime').val()||"";
	var endTime = $('#endTime').val()||"";
	var showName = $('#showName').val()||"";
	
	if (startTime == null || startTime == "" || startTime.length<=0){
		$.toast("起始时间不能为空！");
		return;	
	}
	if (endTime == null || endTime == "" || endTime.length<=0){
		$.toast("起止时间不能为空！");
		return;	
	}
	if (showName == null || showName == "" || showName.length<=0){
		$.toast("商品名称不能为空！");
		return;	
	}
	startTime = startTime + " 00:00:00"
	endTime = endTime +" 23:59:59"
	$.showIndicator();
	var param={interId:'toc.countVerifyOrderDetailInfo',orgId:orgId,startTime:startTime,endTime:endTime,showName:showName};
	xhq.__runXHQ(param, function(data){
		$.hideIndicator();
		if (data.status == 0){
			var opLinkman = getLocalSession("opLinkman") || ""
			$(".order_list").css("display","block")
			$(".offline_name").html(opLinkman)
			$(".date_start").html($('#startTime').val())
			$(".date_end").html($('#endTime').val())
			$(".goods_name").html(showName)
			$(".success_num").html(data.body.makeVeriyCount+'单')
			$(".verification_num").html(data.body.veriyCount+'单')
		}else{
			$.toast(data.message);
		}
	})
	
})
		
		
$(".date").calendar({
    value: [getNowFormatDate()]
});
