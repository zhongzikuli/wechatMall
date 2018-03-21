
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
    // 校验openid
    var openId = getLocalSession("openid") || "";
    var custId = getLocalSession("custId") || "";
    if (openId == "" || custId == "") {
        $.toast("未获取到用户资料，无法访问");
        xhq.gotoErrorPage();
        return;
    }
    openIndicator();
    //查询地址列表信息
    var param = { interId: 'toc.custAddressList', channel: 'C', custId: custId };

    xhq.__runXHQ(param, function (data) {
        // 检测返回值
        if (data.status == 0) {
            var addressListHtml = $(".content-block2").html();
            for (var i = 0; i < data.body.length; i++) {
                var address = data.body[i];
                var phoneNo = address.phoneNo;
                var phoneNoStr = phoneNo.replace(phoneNo.substr(3, 7), "****");
                var detailAddress = address.province + address.city + address.country + address.address;
                addressListHtml += '<div class="address" defaultFlag="' + address.defaultFlag + '" phoneNo="' + address.phoneNo + '" addressId="' + address.addressId + '" province="' + address.province + '" city="' + address.city + '" country="' + address.country + '" address="' + address.address + '"><div class="address-div">';
                addressListHtml += '<span class="addressName">' + address.name + '</span> <span class="attr phone" id="addressPhoneNo" style="color:rgba(0,0,0,1)">' + phoneNoStr + '</span>';
                addressListHtml += '<p style="margin-top:0.2rem;">';
                if (address.defaultFlag == '1') {
                    addressListHtml += '<span id="moren">默认</span>';
                }
                addressListHtml += '<span class="addressAttr attr phone" id="addressDetail" style="color: rgba( 0, 0, 0,0.6);">' + detailAddress + '</span>';
                addressListHtml += '</p>';
                addressListHtml += '</div><span class="bianji">编辑</span></div>';
            }
            $(".content-block2").html(addressListHtml);
            hideIndicator();
        } else {
            hideIndicator();
            $.toast(data.message);
        }
        event()
    });

})

function event() {
	 
	
    var obj1 = {}
    $(".bar footer").click(function () {
    	 var pageType = xhq.getQuery("pageType")||""
    	 xhq.gotoUrl('address_register.html',{pageType:pageType})
    })
    $(".content-block2 .address").each(function () {
        
    	$(this).find(".bianji").click(function(){
            var addressId = $(this).parents(".address").attr("addressId");
            var phoneNo = $(this).parents(".address").attr("phoneNo");
            var province = $(this).parents(".address").attr("province");
            var city = $(this).parents(".address").attr("city");
            var country = $(this).parents(".address").attr("country");
            var address = $(this).parents(".address").attr("address");
            var defaultFlag = $(this).parents(".address").attr("defaultFlag");
            var addressName = $(this).parents(".address").find(".addressName").text();

            var obj = {
                addressId: addressId,
                addressName: addressName,
                phoneNo: phoneNo,
                province: province,
                city: city,
                country: country,
                address: address,
                defaultFlag: defaultFlag
            }
            setLocalSession("address_edit", JSON.stringify(obj))

            var pageType = xhq.getQuery("pageType")||""
            
            xhq.gotoUrl('address_edit.html',{pageType:pageType})
        })
        
        var pageType = xhq.getQuery("pageType")||""
	   	if(pageType=='2'){
	   		 return;
	   	}
    	
        var that = $(this)
        $(this).find(".address-div").click(function(){
                                var addressId = $(this).parents(".address").attr("addressId");
                var phoneNo = $(this).parents(".address").attr("phoneNo");
                var province = $(this).parents(".address").attr("province");
                var city = $(this).parents(".address").attr("city");
                var country = $(this).parents(".address").attr("country");
                var address = $(this).parents(".address").attr("address");
                var defaultFlag = $(this).parents(".address").attr("defaultFlag");
                var addressName = $(this).parents(".address").find(".addressName").text();

                var obj = {
                    addressId: addressId,
                    addressName: addressName,
                    phoneNo: phoneNo,
                    province: province,
                    city: city,
                    country: country,
                    address: address,
                    defaultFlag: defaultFlag
                }
                setLocalSession("localAddressSession", JSON.stringify(obj))
                // alert(JSON.stringify(obj));
                xhq.gotoUrl("order.html");
            })
        

    })
}