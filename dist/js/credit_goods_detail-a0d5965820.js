function getDetail(e){$.showIndicator();var i={interId:"toc.getExchangeDetail",channel:"C",onlineId:e,custId:custId};xhq.__runXHQ(i,function(e){$.hideIndicator(),debug&&console.log(JSON.stringify(e)),0==e.status?(setData(e.body),hideIndicator()):($.toast(e.message),hideIndicator())})}function setData(e){description=editHTML(e.description),$(".text_goods").html(description),specDescription=editHTML(e.specDescription),$(".parameter").html(specDescription),maintainDesction=editHTML(e.maintainDesction),$(".to_know").html(maintainDesction),$(".test-lazyload").picLazyLoad({threshold:100}),setSwiper(e),setGoodsBrief(e),setFoot(e),initOrderJson(e)}function initOrderJson(e){orderJson={showName:e.showName,mailMoney:0,salePrice:e.salePrice,onlineId:e.onlineId,bigPic:e.bigPic,goodId:e.skuId,purchasePrice:0,num:1}}function setGoodsBrief(e){var i=e.salePrice||0,t=e.showName||"",o='<div class="goods_text">'+t+'</div><div class="goods_price"><span>'+i+"</span>积分</div>";$(".mid_box").html(o)}function setSwiper(e){if(e.images&&""!=e.images){var i=e.images.split(",");if(i.length){var t='<div class="swiper-wrapper">';for(var o in i)t+='<div class="swiper-slide"><img src="'+i[o].trim()+'" alt=""></div>';if(t+='</div><div class="swiper-pagination"></div>',$(".swiper-container").html(t),i.length>1){new Swiper(".swiper-container",{pagination:".swiper-pagination",paginationClickable:!0,spaceBetween:30,centeredSlides:!0,autoplay:2500,autoplayDisableOnInteraction:!1})}}}}function setFoot(e){var i=e.status||1,t=e.curPoint||0,o=e.salePrice||0;$("#exchange").html(t),2==i?($(".bar-tab").find(".no_pay").show(),$(".go_pay").hide(),$(".no_credit").hide()):t>=o?$(".bar-tab").find(".go_pay").show().nextAll().hide():($(".bar-tab").find(".no_credit").show(),$(".go_pay").hide(),$(".no_pay").hide())}var debug=!0,openId,custId,orderJson;$(function(){if(openId=getLocalSession("openid")||"",custId=getLocalSession("custId")||"",""==openId||""==custId)return void xhq.gotoErrorPage();var e=xhq.getQuery("onlineId");getDetail(e),$(".go_pay").on("tap",function(){$(this).attr("disabled")||(refreshOrderCache(orderJson),debug&&console.log(getLocalSession("localOrderSession")),param={mailType:"lkgm",sourceType:3,channelType:3},xhq.gotoUrl("order.html",param))})});