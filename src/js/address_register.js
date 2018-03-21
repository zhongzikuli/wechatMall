
$(function () {
    $.init()

    $("#city-picker").cityPicker({
        toolbarTemplate: '<header class="bar bar-nav">\<button id="cancel" class="button button-link pull-left">取消</button>\  <button class="button button-link pull-right close-picker">确定</button>\</header>'
    })

    // 点击取消
    $(document).on("click", "#cancel", function () {
        console.log($(this).parents(".picker-modal"))
        $(this).parents(".picker-modal").css(" display", "none")
    })

    // 设为默认地址
    var tacitly = 0
    $("#set_address").click(function () {
        if ($(this).find("img").attr("src") == "../img/ico_weixuanze.png") {
            $(this).find("img").attr("src", "../img/ico_xuanze.png")
            tacitly = 1
        } else {
            $(this).find("img").attr("src", "../img/ico_weixuanze.png")
            tacitly = 0
        }
    })
    
    
    $("#addressName").on('change',$("#addressName"),function () {
		controlBtn();
	})
	
	$("#phoneNo").on('change',$("#phoneNo"),function () {
		controlBtn();
	})
	
	$("#city-picker").on('change',$("#city-picker"),function () {
		controlBtn();
	})
	
	$("#address").on('change',$("#address"),function () {
		controlBtn();
	})
    
	 function controlBtn(){
    	var s1 = $("#addressName").val() || "";
    	var s2 = $("#phoneNo").val() || "";
    	var s3 = $("#city-picker").val() || "";
    	var s4 = $("#address").val() || "";
    	if (s1 != "" && s2 != "" && s3 !="" && s4 != ""){
    		$("#baocun").css("background-color", "rgb(222, 63, 55)");
    	}
    }
    

    // 保存地址
    $("#baocun").click(function () {
        var obj = {}
        var addr = $("#city-picker").val();
        var addrs = addr.split(" ");
        obj.province = addrs[0];//省
        obj.city = addrs[1];//市
        if (addrs.length = 3) {
            obj.country = addrs[2];//县
        }

        obj.custId = getLocalSession("custId");
        //obj.addressId = $("#addressId").val();
        obj.name = $("#addressName").val()
        obj.phoneNo = $.trim($("#phoneNo").val())

        if(obj.phoneNo==''||obj.phoneNo == null){
        	$.toast("手机号码不能为空");
			return;	
        }
        var re = /^[0-9]+.?[0-9]*$/;
		if(!re.test(obj.phoneNo)){
        	$.toast("手机号码格式不正确");
			return;	
        }
        if (obj.phoneNo.length != 11){
			$.toast("手机号码长度不正确，请检查");
			return;	
		}
        
//        var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
//		if(!regexp.test(obj.phoneNo)){
//			$.toast('手机号码错误');
//			return;
//		}
		
//        if (!/^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(obj.phoneNo)) {
//            $.toast("手机号码输入有误");
//            return;
//        }
        
        // 验证名字
        if (!/[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/i.test(obj.name)) {
            $.toast("名字不能超过4个汉字不能少于2个汉字")
            return

        } else {
            if (obj.name.length > 4 || obj.name.length < 1) {
                $.toast("名字不能超过4个汉字不能少于2个汉字")
                return
            }
        }
        if ($("#address").val() == null || $("#address").val() == "") {
            $.toast("地址不能为空")
            return
        }
        obj.address = $("#address").val()
        
        if ($("#city-picker").val() == null || $("#city-picker").val() == "") {
            $.toast("省市不能为空")
            return
        }
        
        if ($("#set_address").find("img").attr("src") == "../img/ico_weixuanze.png") {
            //不默认
            obj.defaultFlag = 0;
        } else {
            //默认
            obj.defaultFlag = 1;
        }
        obj.interId = 'toc.addCustAddress';//修改地址信息
        obj.channel = 'C';

        xhq.__runXHQ(obj, function (data) {
            // 检测返回值
            if (data.status == 0) {
            	var type = xhq.getQuery("type")||""
            	var pageType = xhq.getQuery("pageType")||""
            	if(type == '2'){
            		setDefaultAdress(data)
            		  // 跳转页面，
	                 xhq.gotoUrl('order.html',{pageType:pageType})
            	}else{
            		 setDefaultAdress(data)
            		  // 跳转页面，
                	 xhq.gotoUrl('address_list.html',{pageType:pageType})
            	}
              
            } else {
                $.toast(data.message);
            }
        });
    })
    
    function setDefaultAdress(data){
    	 var addressObj = {
                 addressId:data.body.id,
                 addressName:data.body.name,
                 phoneNo:data.body.phoneNo,
                 province:data.body.province,
                 city:data.body.city,
                 country:data.body.country,
                 address:data.body.address,
                 defaultFlag:data.body.defaultFlag
             }
        setLocalSession("localAddressSession", JSON.stringify(addressObj))
    }

//    $("#address").click(function () {
//        $(this).val($("#city-picker").val())
//    })

})