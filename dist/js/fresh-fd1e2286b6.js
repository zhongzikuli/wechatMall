function openIndicator(){$.showIndicator(),isIndicator=!0}function hideIndicator(){isIndicator&&($.hideIndicator(),isIndicator=!1),loading=!1}var pageNo=0,pageSize=20,isIndicator=!1,isAppendMode=1,$content=null,loading=!1;$(function(){function i(){pageNo+=1;var i={interId:"toc.getGoodsOnline",channel:"C",sortType:1,filter:2,pageNo:pageNo,pageSize:pageSize};xhq.__runXHQ(i,function(i){0==i.status?(n(i),(null==i.body||i.body.length<pageSize)&&($.detachInfiniteScroll($content),$(".infinite-scroll-preloader").remove()),loading=!1):(hideIndicator(),$.toast(i.message)),hideIndicator()})}function n(i){var n="";if(0==isAppendMode&&($(".content .list_container").html(""),isAppendMode=1),null!=i.body&&i.body.length>0){for(var s=0;s<i.body.length;s++){var t=i.body[s];n+=1==t.isSale?e(t):o(t)}$(".content .list_container").append(n)}}function e(i){var n='<li class="goodsclass"><a href="goods_detail.html?onlineId='+i.onlineId+"&"+xhq.getVersion()+'" class="selling_item" data-transition="slide-in"><div class="selling_pic"><img src='+i.ImageUrl+'><div class="selling_icon"><img src="../img/icon_temai.png" alt=""></div></div><div class="selling_text"><div class="selling_title">'+i.showName+'</div><div class="selling_price"><div class="price_detail"><p class="price_one"><span>&yen;'+i.salePrice/100+"</span>";return null!=i.endTime&&void 0!=i.endTime&&(n+="<span>"+i.endTime+"</span>结束"),n+='</p></div><div class="go_buy"><p class="bonus">送积分:<span>'+i.money+"</span></p></div></div></div></a></li>"}function o(i){var n='<li class="goodsclass"><a href="goods_detail.html?onlineId='+i.onlineId+"&"+xhq.getVersion()+'" class="selling_item" data-transition="slide-in"><div class="selling_pic"><img src='+i.ImageUrl+'></div><div class="selling_text"><div class="selling_title">'+i.showName+'</div><div class="selling_price"><div class="price_detail"><p class="price_one"><span>&yen;'+i.salePrice/100+"</span>";return null!=i.endTime&&void 0!=i.endTime&&(n+="<span>"+i.endTime+"</span>结束"),n+='</p></div><div class="go_buy"><p class="bonus">送积分:<span>'+i.money+"</span></p></div></div></div></a></li>"}$(document).on("pageInit","#page-ptr",function(n,e,o){$content=$(o).find(".content"),$(o).on("infinite",function(n){loading||(openIndicator(),loading=!0,setTimeout(function(){isAppendMode=1,i(),$.refreshScroller()},1e3))})}),$.init(),openIndicator(),i(),$("#tome").on("tap",function(){xhq.gotoUrl("me.html")}),$("#tohome").on("tap",function(){xhq.gotoUrl("home.html")}),$("#totype").on("tap",function(){xhq.gotoUrl("goodtypes.html")})});