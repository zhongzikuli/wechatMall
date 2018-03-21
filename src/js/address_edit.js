function openIndicator() {
	$.showIndicator();
	isIndicator = true;
}

function hideIndicator() {
	if (isIndicator) {
		$.hideIndicator();
		isIndicator = false;
	}
	loading = false;
}


$(document).ready(function () {

	var openId = getLocalSession("openid") || "";
	var custId = getLocalSession("custId") || "";
	if (openId == "" || custId == "") {
		$.toast("未获取到用户资料，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	openIndicator();

	var address_edit = JSON.parse(getLocalSession("address_edit"))
	if (address_edit) {
		$("#addressId").val(address_edit.addressId);
		$("#phoneNo").val(address_edit.phoneNo);
		$("#address").val(address_edit.address);
		$("#addressName").val(address_edit.addressName);
		if (address_edit.defaultFlag == 1) {
			$("#set_address").find("img").attr("src", "../img/ico_xuanze.png");
		}
		if (address_edit.country == null || address_edit.country == '') {
			$("#city-picker").val(address_edit.province + " " + address_edit.city + " ");
			$("#address").val(address_edit.address);
		} else {
			$("#city-picker").val(address_edit.province + " " + address_edit.city + " " + address_edit.country);
			$("#address").val(address_edit.address);
		}
		hideIndicator();
	}
})
$(function () {
	$.init()
	//删除地址
	$(document).on('click', '.confirm-ok', function () {
		$.confirm('确定要删除地址吗？', function () {
			var addressId = $("#addressId").val();
			var param = { interId: 'toc.delCustAddress', channel: 'C', addressId: addressId };
			xhq.__runXHQ(param, function (data) {
				// 检测返回值
				if (data.status == 0) {
					//把用户缓存的地址制空
					var localAddressSession = getLocalSession("localAddressSession")
					if(localAddressSession!=null&&localAddressSession.length>0){
						var addressSesion = JSON.parse(localAddressSession)
						if(addressSesion.addressId==addressId){
							setLocalSession("localAddressSession","")
						}
					}
				 var pageType = xhq.getQuery("pageType")||""
                 xhq.gotoUrl('address_list.html',{pageType:pageType})
				} else {
					hideIndicator();
					$.toast(data.message);
				}
			});

		});
	});

	$("#city-picker").cityPicker({
		toolbarTemplate: '<header class="bar bar-nav">\ <button id="cancel" class="button button-link pull-left">取消</button>\  <button class="button button-link pull-right close-picker">完成</button>\<h1 class="title"></h1>\ </header>'
	});

	$(document).on("click", "#cancel", function () {
		console.log($(this).parents(".picker-modal"))
		$(this).parents(".picker-modal").css(" display", "none")
	})
	// xiang
	// 设为默认地址
	$("#set_address").click(function () {
		if ($(this).find("img").attr("src") == "../img/ico_weixuanze.png") {
			$(this).find("img").attr("src", "../img/ico_xuanze.png")
		} else {
			$(this).find("img").attr("src", "../img/ico_weixuanze.png")
		}
	})
	
	// 保存地址
	$("#baocun").click(function () {
		var obj = {}
		var addr = $("#city-picker").val();

		addr = addr.split(" ");
		obj.province = addr[0];//省
		obj.city = addr[1];//市
		if (addr.length = 3) {
			obj.country = addr[2];//县
		}

		obj.custId = getLocalSession("custId");
		obj.addressId = $("#addressId").val();
		obj.name = $("#addressName").val()
        obj.phoneNo = $.trim($("#phoneNo").val())

        if(obj.phoneNo==''){
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

//		var regexp = new RegExp("^(13[0-9]|15[012356789]|17[0135678]|18[0-9]|14[57])[0-9]{8}$",'ig');
//		if(!regexp.test(obj.phoneNo)){
//			$.toast('手机号码错误');
//			return;
//		}
			
//		if (!/^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test(obj.phoneNo)) {
//			$.toast("手机号码输入有误");
//			return;
//		}
		
		// 验证名字
		if (!/[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/i.test(obj.name)) {
			$.toast("名字不能超过4个汉字不能少于2个汉字")
			return

		} else {
			if (obj.name.length > 5 || obj.name.length < 1) {
				$.toast("名字不能超过4个汉字不能少于2个汉字")
				return
			}
		}

		if ($("#address").val() == null || $("#address").val() == "") {
			$.toast("地址不能为空")
			return
		}

		obj.address = $("#address").val()

		if ($("#set_address").find("img").attr("src") == "../img/ico_weixuanze.png") {
			//不默认
			obj.defaultFlag = 0;
		} else {
			//默认
			obj.defaultFlag = 1;
		}
		obj.interId = 'toc.updateCustAddress';//修改地址信息
		obj.channel = 'C';

		xhq.__runXHQ(obj, function (data) {
			// 检测返回值
			if (data.status == 0) {
				// 跳转页面
				var pageType = xhq.getQuery("pageType")||""
				if(pageType=='2'){
					setDefaultAdress(obj)
				}
                xhq.gotoUrl('address_list.html',{pageType:pageType})
			} else {
				$.toast(data.message);
			}
		});
	})

	function setDefaultAdress(data){
   	 var addressObj = {
                addressId:data.addressId,
                addressName:data.name,
                phoneNo:data.phoneNo,
                province:data.province,
                city:data.city,
                country:data.country,
                address:data.address,
                defaultFlag:data.defaultFlag
            }
       setLocalSession("localAddressSession", JSON.stringify(addressObj))
   }

})
