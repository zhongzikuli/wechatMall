var custId=0;
var userType=0;

var card_name =$('.card_name');
var card_num =$('.card_num');
var select =$('.select');
var card_count =$('.card_count');
$(function () {
	custId = getLocalSession("custId") || "0";
	userType = getLocalSession("userType") || "1";
	if (userType != 2 || custId <= 0){
		$.toast("非合法用户，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	
	// 接收传入的参数
	card_name.val(xhq.getQuery('cardowner')||"");
	card_num.val(xhq.getQuery('bankcard')||"");
	select.val(xhq.getQuery("bankname"));
	card_count.val(xhq.getQuery("openbank")||"")
	controlBtn();

	card_name.on('change',card_name,function () {
		controlBtn();
	});
	
	card_num.on('change',card_name,function () {
		controlBtn();
	});
	
	select.on('change',card_name,function () {
		controlBtn();
	});
	
	card_count.on('change',card_name,function () {
		controlBtn();
	});
    
    $('.btn_box>p').on('tap',function(){
    	// 判断当前css中是否有active
    	if ($(this).hasClass("active")){
    		var s1 = card_name.val() || "";
        	var s2 = card_num.val() || "";
        	var s3 = select.val() || "";
        	var s4 = card_count.val() || "";
    		if (s2.length<16){
    			$.toast("请检查银行卡号是否输入正确");
    			return;
    		}
    		xhq.gotoUrl("bind_card3.html",{on:s1,bc:s2,bn:s3,pn:s4});
    	}		
    });
    
    function controlBtn(){
    	var s1 = card_name.val() || "";
    	var s2 = card_num.val() || "";
    	var s3 = select.val() || "";
    	var s4 = card_count.val() || "";
    	if (s1 == "" || s2 == "" || s3 =="" || s3=="请选择银行" || s4 == ""){
    		$('.btn_box>p').removeClass('active');
    	}else{
    		$('.btn_box>p').addClass('active');
    	}
    }
});
