$(document).ready(function () {
	
	var orgId = getLocalSession("orgId")||"";
	var verifyCode = xhq.getQuery("verifyCode")||"";
	
	if(orgId=='' || orgId ==null){
		xhq.gotoUrl('../html/verify_login.html')
		return;
	}
	if(verifyCode=='' || verifyCode ==null){
		$.toast('核销码不能为空！');
		return;
	}
	
	$.showIndicator();
	var param={interId:'toc.verifyCodeOrderDetail',orgId:orgId,verifyCode:verifyCode};
	xhq.__runXHQ(param, function(data){
		$.hideIndicator();
		if (data.status == 0){
			if(data.body!=null){
				 var yxqzLong = data.body.yxqzTime.substring(0,10)
			     yxqzLong = (new Date(yxqzLong).getTime()) + 1000*60*60*24;
				 var date=new Date(); 
				 var currentDate = date.getTime();
				
				if(yxqzLong>currentDate && data.body.verifyStatus=='1'){
					$(".tab-label").text("确定核销");
				}else{
					$(".tab-label").text("确定");
				}
				$(".content").html(verifyHtml(data.body));
			}else{
				$(".content").html(nullHtml());
				$(".tab-label").text("返回");
			}
		}else{
			$(".bar-tab").css('display','none')
			 $.alert(data.message+",请重新核销", function () {
				 xhq.gotoUrl('../html/verification.html')
			 });
			
		}
	});
	
})

	// 确定核销
	$(".bar-tab").on('tap',function(){
		 
		if($(".tab-label").text()=="确定核销"){
			// 校验手机号和验证码是否已输入
			var orgId =  xhq.getQuery("orgId")||"";//供应商id
			var verifyCode = xhq.getQuery('verifyCode')||"";
			if (verifyCode == null || verifyCode == ""){
				$.toast("消费码未录入");
				return;	
			}
			if (verifyCode.length != 8){
				$.toast("消费码长度不正确，请检查");
				return;	
			}
			
			$.showIndicator();
			var param={interId:'toc.verifyOrderDetail',verifyCode:verifyCode};
			xhq.__runXHQ(param, function(data){
				$.hideIndicator();
				if (data.status == 0){
					 $.alert('核销成功，跳转到核销页面！', function () {
						 xhq.gotoUrl('../html/verification.html')
				     });
					 return;
				}else{
					$.toast(data.message);
				}
			});
		}else{
			xhq.gotoUrl('../html/verification.html')
		}
		
	})

function nullHtml(){
	var html = '<div class="big_box none">'
	html += '<div class="top_box">'
	html += '<img src="../img/search_icon.png" alt="">'
	html += '</div>'
	html += '<div class="bottom_box">此券码还没有被发现</div>'
	html += '</div>'
	return html;
}

function verifyHtml(data){
	
	var html = '<div class="big_box end" >'
	 html += '<div class="mid_box">'
	 html += '<div class="mid_l"><img src="'+data.bigPic+'" alt=""></div>'
	 html += '<div class="mid_c">'
	 html += '<div class="text_name">'+data.showName+'</div>'
	 html += '<div class="text_box">'
	 html += '<div class="text_pri">&yen;<span>'+data.salePrice/100+'</span></div>'
	 html += '<div class="text_num">x<span>'+data.num+'</span></div>'
	 html += '</div>'
	 html += '</div>'
	 html += '</div>'

	 html += '<div class="up_box">'
	 html += '<span class="up_l">商家信息：</span>'
	 html += '<span class="up_name">'+data.name+'</span>'
	 html += '</div>'
	 html += '<div class="code_infor">消费券码：<span>'+data.verifyCode+'</span></div>'
	 html += '<div class="con_box">'
	 
	 var yxqzLong = data.yxqzTime.substring(0,10)
     yxqzLong = (new Date(yxqzLong).getTime()) + 1000*60*60*24;
	 var date=new Date(); 
	 var currentDate = date.getTime();
	 
	 if(yxqzLong>currentDate){
		 if(data.verifyStatus=='1'){
			 html += '<div class="text_data">有效期至：<span>'+data.yxqzTime+'</span></div>'
			 html += '<div class="up_state">未消费</div>'
		 }else{
			 html += '<div class="text_data">核销时间：<span>'+data.verifiyTime+'</span></div>'
			 html += '<div class="up_state">已消费</div>'
		 }
	 }else{
		 html += '<div class="text_data">有效期至：<span>'+data.yxqzTime+'</span></div>'
		 html += '<div class="up_state">已过期</div>'
	 }
	
	 html += '</div>'
	 html += '</div>'
	return html;
}
