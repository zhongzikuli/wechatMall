var custId=0,userType=0;$(function(){function e(e){var o={interId:"toc.updateCustImg",custId:custId,mediaId:e};xhq.__runXHQ(o,function(e){$.hideIndicator(),0==e.status?($(".head_pic").attr("src",e.body),setLocalSession("headimgUrl",e.body)):$.toast(e.message)})}return custId=getLocalSession("custId")||"0",userType=getLocalSession("userType")||"1",custNumber=getLocalSession("custNumber")||"",""!=custNumber&&18==custNumber.length&&(custNumber=custNumber.replace(custNumber.substr(4,10),"******")),custId<=0?void xhq.gotoErrorPage():($("#tochgname").on("tap",function(){xhq.gotoUrl("change_name.html")}),$("#tochgphone").on("tap",function(){xhq.gotoUrl("change_phone.html")}),$("#toaddr").on("tap",function(){xhq.gotoUrl("address_list.html",{pageType:2})}),$(".head_pic").attr("src",getLocalSession("headimgUrl")),$("#nickName").html(getLocalSession("nickName")),$("#phoneNo").html(getLocalSession("phoneNo")||"未绑定"),$("#inviteCode").html(getLocalSession("inviteCode")),$("#custNumber").html(custNumber),xhq.initWXJsConfig(["chooseImage","uploadImage"]),wx.ready(function(){}),void $("#chooseImg").on("tap",function(){wx.chooseImage({count:1,sizeType:["compressed"],sourceType:["album","camera"],success:function(o){$.showIndicator(),wx.uploadImage({localId:o.localIds.toString(),isShowProgressTips:0,success:function(o){e(o.serverId)}})}})}))});