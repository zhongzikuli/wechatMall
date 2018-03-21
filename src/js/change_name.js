var custId=0;
var userType=0;

$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (custId <= 0){
		xhq.gotoErrorPage();
		return;
	}
	
	$("#clearNr").on('tap',function(){
		$(".inp_box").val("");
	});
	
	$(".btn_box").on('tap',function(){
		// 校验昵称输入及长度
		var name=($(".inp_box").val()||"").trim();
		if (name.length<1){
			$.toast("请输入昵称");
			return;
		}
		
		if (name.length>16){
			$.toast("昵称长度不能超过16位");
			return;
		}
		
		$.showIndicator();
		var param={interId:'toc.updateCustInfo',nickName:name,custId:custId};
		xhq.__runXHQ(param, function(data){
			$.hideIndicator();
			if (data.status == 0){
				$.toast("保存成功");
				setLocalSession("nickName",name);
			}else{
				$.toast(data.message);
			}
		});
	})
	
	$(".inp_box").val(getLocalSession("nickName") || '');
});
