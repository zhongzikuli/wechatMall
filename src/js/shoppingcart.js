
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
//存放购物车缓存信息‰
//setLocalSession("shoppingCartLocalSession", '{"body":[{ "showName": "llllgasadsadsadsadasdsaasfasdfasdfsadfsadfsadsa", "money": 200, "salePrice": 2000, "onlineId": 5,"bigPic": "http://file.cdn.xiaohongquan.cn/20161130/a5ca1b2626774fc709347fe0e0093496.jpg","mailMoney": 220, "fullName": "tang3 214 31", "goodId": 6, "purchasePrice": 2000, "num": 2, "sourceId":""},{"showName": "hkliiytrterewe3wwdsddsd", "money": 800,"salePrice": 600, "onlineId": 6,"channel": 1,   "bigPic": "http://file.cdn.xiaohongquan.cn/20161130/a5ca1b2626774fc709347fe0e0093496.jpg  ","mailMoney": 300, "fullName": "T23 T1Gsdf DG", "goodId": 6,  "purchasePrice": 600,"num": 3,"sourceId":"" }]}');
//获取购物车缓存信息
var shopingCartSession = getLocalSession("shoppingCartLocalSession");

// 1页面加载逻辑
// 1.1加载购物车缓存
$(document).ready(function () {

	// 校验openid
	var openId = getLocalSession("openid") || "";

	if (openId == "") {
		$.toast("未获取到用户资料，无法访问");
		xhq.gotoErrorPage();
		return;
	}
	openIndicator();



	var mailList = $("#mailList").html();
	if (shopingCartSession == null || shopingCartSession == undefined || shopingCartSession == '') {
		nullCartHtml();
		shoppingCart_advertHtml();
		hideIndicator();
		return;
	} else {
		shopingCartSession = JSON.parse(shopingCartSession);
		if (shopingCartSession.body == null || shopingCartSession.body.length == 0) {
			nullCartHtml();
			shoppingCart_advertHtml();
			hideIndicator();
			return;
		}
		//购物车中上线商品ids
		var onlineIds = '';

		for (var h = 0; h < shopingCartSession.body.length; h++) {
			var tonline = shopingCartSession.body[h];
			if (h < (shopingCartSession.body.length - 1)) {
				onlineIds = onlineIds + tonline.onlineId + ",";
			} else {
				onlineIds = onlineIds + tonline.onlineId;
			}
		}


		//查询购物车的上线商品有效 上架的商品
		var param = { interId: 'toc.getCheckGoodsIsOnline', channel: 'C', onlineIds: onlineIds };
		xhq.__runXHQ(param, function (data) {
			// 检测返回值
			if (data.status == 0) {

				var onlineMailListHtml="";
				var unlineMailListHtml="";
				for (var j = shopingCartSession.body.length-1; j>=0; j--) {
					var b = false;
					var shoppingCartGoods = shopingCartSession.body[j];
					var onlineGoods;
					if (data.body != null && data.body.length > 0) {
						for (var i = 0; i < data.body.length; i++) {
							onlineGoods = data.body[i];
							if (shoppingCartGoods.onlineId == onlineGoods.onlineId) {
								b = true;
								break;
							}
						}
					}

					if (b) {
						//上线商品
						onlineMailListHtml = onlineMailListHtml + shoppingCartHtml(mailList, onlineGoods, shoppingCartGoods)
					} else {
						//过期的商品
						unlineMailListHtml = unlineMailListHtml + timeOutCart(mailList, shoppingCartGoods)
					}
				}

				$("#mailList").append(onlineMailListHtml);
				$("#mailList").append(unlineMailListHtml);
				shoppingCart_advertHtml();
				shoopcart_event();
				hideIndicator();
			} else {
				hideIndicator();
				$.toast(data.message);
			}
		});

	}
})


function shoppingCart_advertHtml() {
	//获取免邮费金额
	var param = { interId: 'toc.getAvoidExpressFee', channel: 'C' };
	xhq.__runXHQ(param, function (data) {
		if (data.status == 0) {
			$("#avoidExpressFee").val(data.body.avoidExpressFee);
			setLocalSession("avoidExpressFee", data.body.avoidExpressFee);//免邮费
			setLocalSession("expressFee", data.body.expressFee);//邮费
			setLocalSession("deliverSureDay", data.body.deliverSureDay);//延迟天数
			setLocalSession("cancelDelday", data.body.cancelDelday);//延迟天数
			if(data.body.avoidExpressFee==0){
				$("#shoppingWarn").html(data.body.cancelDelday + "天无忧退货  全场包邮");
			}else{
				$("#shoppingWarn").html(data.body.cancelDelday + "天无忧退货  满" + data.body.avoidExpressFee / 100 + "元免邮  全程正品保障");
			}
			
		} else {
			hideIndicator();
			$.toast(data.message);
		}
	})
}

//在线商品
function shoppingCartHtml(mailList, onlineGoods, shoppingCartGoods) {
	var mailList = '<div class="list1" onlineId=' + onlineGoods.onlineId + ' mailMoney=' + onlineGoods.mailMoney + ' goodId=' + onlineGoods.goodId + '>';
	mailList += '<div class="list1-radio"><img src="../img/icoWeixuanze@2x.png" alt=""></div>';
	mailList += '<div class="list1-img"><img src="' + onlineGoods.bigPic + '" alt=""></div>';
	mailList += '<div class="list1-wenzi">';
	mailList += '<p>' + onlineGoods.showName + '</p>';
	mailList += '<span class="bargain-price price" salePrice=' + onlineGoods.salePrice + '>' + onlineGoods.salePrice / 100 + '</span>';
	if(onlineGoods.purchasePrice>0){
		mailList += '<span class="bar1 price" purchasePrice=' + onlineGoods.purchasePrice + '>' + onlineGoods.purchasePrice / 100 + '</span>';
	}else{
		mailList += '<span purchasePrice=' + onlineGoods.purchasePrice + '></span>';
	}
	mailList += '<p class="num_box shangjia">';
	mailList += '<span class="span1 cutdown subtract">-</span>';
	mailList += '<span num="' + shoppingCartGoods.num + '" class="num_handle num">' + shoppingCartGoods.num + '</span>';
	mailList += '<span class="span1 add">+</span>';
	mailList += '</p>';
	mailList += '</div>';
	mailList += '</div>';
	return mailList;
}

//过期的商品
function timeOutCart(mailList, shoppingCartGoods) {

	var mailList = '<div class="list1" onlineId=' + shoppingCartGoods.onlineId + ' mailMoney=' + shoppingCartGoods.mailMoney + ' goodId=' + shoppingCartGoods.goodId + '>';
	mailList += '<div class="list1-radio"><img src="../img/icoWeixuanze@2x.png" alt=""></div>';
	mailList += '<div class="list1-img"><img src="' + shoppingCartGoods.bigPic + '" alt=""></div>';
	mailList += '<div class="list1-wenzi">';
	mailList += '<p>' + shoppingCartGoods.showName + '</p>';
	mailList += '<span class="bargain-price price" salePrice=' + shoppingCartGoods.salePrice + '>' + shoppingCartGoods.salePrice / 100 + '</span>';
	mailList += '<p class="shixiao">失效</p>';
	mailList += '</div>';
	mailList += '</div>';
	return mailList;
}

function nullCartHtml() {
	var mailListHtml = '<div style="width:100vw;height:100vh;background-color:white;"><div class="kongde">';
	mailListHtml += '<div>';
	mailListHtml += '<img id="cart1" src="../img/group2@2x.png" alt="">';
	mailListHtml += '</div>';
	mailListHtml += '<p style="margin-top:0rem;">购物车空空的 <br> 快去挑几件好货吧</p>';
	if (xhq.getQuery("fromUserType") == 2)
		mailListHtml += '<p style="margin-top: 1.2rem;"><span onclick="window.location.href=\'home.html?'+xhq.getVersion()+'\'">返回首页</span></p>';
	else{
		if (xhq.getQuery("isWs") == 1){
			mailListHtml += '<p style="margin-top: 1.2rem;"><span onclick="window.location.href=\'ws_home.html?'+xhq.getVersion()+'\'">返回首页</span></p>';
		}else{
			mailListHtml += '<p style="margin-top: 1.2rem;"><span onclick="window.location.href=\'home.html?'+xhq.getVersion()+'\'">返回首页</span></p>';
		}
	}
		
	mailListHtml += '</div></div>';
	$("footer").css("display", "none");
	$("#mailList").append(mailListHtml);
}

// 拿出数据
function bianlishuju() {
	var objarr = {};
	var arr = [];
	var arr1 = [];
	for (var i = 0; i < $(".list1").length; i++) {

		if ($(".list1").eq(i).find(".list1-radio img").attr("src") == "../img/ico_xuanze.png") {
			var obj = {}
			obj.onlineId = $(".list1").eq(i).attr("onlineId")
			obj.mailMoney = $(".list1").eq(i).attr("mailMoney") == (null || '') ? 0 : $(".list1").eq(i).attr("mailMoney")
			obj.goodId = $(".list1").eq(i).attr("goodId")
			obj.bigPic = $(".list1").eq(i).find(".list1-img img").attr("src")
			obj.showName = $(".list1").eq(i).find(".list1-wenzi p").eq(0).text()
			obj.salePrice = $(".list1").eq(i).find(".list1-wenzi .bargain-price").attr("salePrice")
			obj.purchasePrice = $(".list1").eq(i).find(".list1-wenzi .bar1").attr("purchasePrice")
			obj.num = $(".list1").eq(i).find(".list1-wenzi .num").text()
			arr.push(obj)
			var shixiao = $(".list1").eq(i).find('.list1-wenzi .shixiao').text()||"";
			if (shixiao!="") {
				//选中不能下单商品
				var xiadan = 1
			}
		} else {
			var obj1 = {}
			obj1.onlineId = $(".list1").eq(i).attr("onlineId")
			obj1.mailMoney = $(".list1").eq(i).attr("mailMoney")
			obj1.goodId = $(".list1").eq(i).attr("goodId")
			obj1.bigPic = $(".list1").eq(i).find(".list1-img img").attr("src")
			obj1.showName = $(".list1").eq(i).find(".list1-wenzi p").eq(0).text()
			obj1.salePrice = $(".list1").eq(i).find(".list1-wenzi .bargain-price").attr("salePrice")
			obj1.purchasePrice = $(".list1").eq(i).find(".list1-wenzi .bar1").attr("purchasePrice") == (null || '') ? 0 : $(".list1").eq(i).find(".list1-wenzi .bar1").attr("purchasePrice")
			obj1.num = $(".list1").eq(i).find(".list1-wenzi .num").text()
			arr1.push(obj1)
		}
	}
	objarr.arr = arr
	objarr.arr1 = arr1
	objarr.xiadan = xiadan
	return objarr

}
function shoopcart_event() {

	// 商品数量减少
	$(".list1").each(function () {
		$(this).find(".list1-wenzi p .cutdown").click(function () {
			if ($(this).parents(".list1").find(".list1-radio img").attr("src") == "../img/ico_xuanze.png") {
				if (parseFloat($(this).parents("p").find(".num").attr("num")) > 1) {
					var f = $(this).parents(".list1-wenzi").find(".bargain-price").text() * 100
					$('footer p span').eq(2).text(function () {
						var totalMoney = $('footer p span').eq(2).text() * 100 - f
						return parseFloat(totalMoney / 100).toFixed(2)
					})
				}
			}

			var input_num = $(this).parents("p").find(".num");
			input_num.text(function () {
				if (parseInt(input_num.attr("num")) > 1) {

					var onlineId = $(this).parents(".list1").attr("onlineId")
					//缓存数量减一
					operationShoppingCartLocalSession(onlineId, 2);
					return parseInt(input_num.text()) - 1
				} else {
					return 1
				}
			}).attr("num", function () {
				if (parseFloat(input_num.attr("num")) > 1) {
					return (parseFloat(input_num.attr("num")) - 1).toString()
				} else {
					return 1
				}

			})
		})
	})

	var i = 0
	// 商品数量增加
	$(".list1").each(function () {
		$(this).find(".list1-wenzi p").eq(1).find(".add").click(function () {
			var input_num = $(this).parents("p").find(".num")
			input_num.text(parseInt(input_num.text()) + 1)
			input_num.attr("num", function () {
				return (parseFloat(input_num.attr("num")) + 1).toString()
			})

			var onlineId = $(this).parents(".list1").attr("onlineId")
			//缓存数量加一
			operationShoppingCartLocalSession(onlineId, 1)
			if ($(this).parents(".list1").find(".list1-radio img").attr("src") == "../img/ico_xuanze.png") {
				var f = $(this).parents(".list1").find(".list1-wenzi span").eq(0).text() * 100
				$('footer p span').eq(2).text(function () {
					var totalMoney = ((parseFloat($('footer p span').eq(2).text())) * 100 + f)

					return parseFloat(totalMoney / 100).toFixed(2)
				})
			}

		})
	})

	/**
	 * 购物车缓存shoppingCartLocalSession 上线id：onlineId,操作类型：operationType 1：添加 2:减少 3,移除购物车
	 */
	function operationShoppingCartLocalSession(onlineId, operationType) {

		var cartSession = JSON.parse(getLocalSession("shoppingCartLocalSession"));
		var onlineGood;
		for (var i = 0; i < cartSession.body.length; i++) {
			if (cartSession.body[i].onlineId == onlineId) {
				onlineGood = cartSession.body[i];
				if (operationType == 1) {
					onlineGood.num = onlineGood.num + 1;
					break;
				} else if (operationType == 2) {
					onlineGood.num = onlineGood.num - 1;
					break;
				} else if (operationType == 3) {
					cartSession.body.splice(i, 1);
					if (cartSession.body.length == 0) {
						nullCartHtml();
					}
					break;
				}
			}
		}
		setLocalSession("shoppingCartLocalSession", JSON.stringify(cartSession));
	}


	// 单选商品
	var e = 0
	$(".list1").each(function () {
		$(this).find(".list1-radio").click(function () {
			if ($(this).find("img").attr("src") == "../img/ico_xuanze.png") {
				e--
				$(this).find("img").attr("src", "../img/icoWeixuanze@2x.png")
				if ($(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text() == "" || $(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text() == null) {
					var c = 0
				}
				else {
					var c = parseFloat($(this).parents(".list1").find(".list1-wenzi span").eq(0).text()) * parseFloat($(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text()) * 100
				}
				$("footer p span").eq(2).text(function () {
					var d = (parseFloat($("footer p span").eq(2).text()) * 100 - c) / 100
					return d.toFixed(2).toString()
				})

			} else {
				e++
				$(this).find("img").attr("src", "../img/ico_xuanze.png")
				if (typeof (parseFloat($(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text())) == "number") {
					if (parseFloat($(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text()) == "" || $(this).parents(".list1").find(".list1-wenzi p").eq(1).find(".num").text() == null) {
						var b = 0
					}
					else {
						var b = parseFloat($(this).parents(".list1").find(".list1-wenzi .bargain-price").text()) * parseInt($(this).parents(".list1").find(".list1-wenzi .num").text()) * 100
					}
				}

				$("footer p span").eq(2).text(function () {
				var a = (b + parseFloat($("footer p span").eq(2).text()) * 100) / 100
					return a.toFixed(2).toString()
				})
			}
			if($(".list1").length == e){
				$("footer .click1 img").attr("src","../img/ico_xuanze.png")
				i++
			}else{
				$("footer .click1 img").attr("src","../img/icoWeixuanze@2x.png")
				i++
				}
		})
	})
	// 全选商品
	$("footer .click1").click(function () {
		i++
		if (i % 2 == 0) {
			$(".list1 .list1-radio img").attr("src", "../img/icoWeixuanze@2x.png")

			$("footer .click1 img").attr("src", "../img/icoWeixuanze@2x.png")
			$("footer p span").eq(2).text("0.00")
		} else {
			$(".list1 .list1-radio img").attr("src", "../img/ico_xuanze.png")
			$("footer .click1 img").attr("src", "../img/ico_xuanze.png")
			$("footer p span").eq(2).text("0")
			$(".list1").each(function () {
				if (typeof (parseFloat($(this).find(".list1-wenzi  .num").text())) == "number") {
					if ($(this).find(".list1-wenzi  .num").text() == "" || $(this).find(".list1-wenzi  .num").text() == null) {
						var h = 0
					} else {
			var h = parseFloat($(this).find(".list1-wenzi .bargain-price").text()) * parseFloat($(this).find(".list1-wenzi .num").text()) * 100
					}
				} else {
					var h = parseFloat($(this).find(".list1-wenzi span").eq(0).text())
				}
				$("footer p span").eq(2).text(function () {
					return ((h + (parseFloat($("footer p span").eq(2).text())) * 100) / 100).toFixed(2).toString()
				})
			})
		}

	})
	// 删除
	$("#shanchu").click(function () {
		
		var obj = bianlishuju()
		if (obj.arr.length == 0) {
		   $.toast("请选择删除商品")
		   return;
		}
		
		 $.confirm('您确定要删除吗?', function () {
			  $(".list1").each(function () {
					if ($(this).find(".list1-radio img").attr("src") == "../img/ico_xuanze.png") {
						$(this).remove($(this).find('.list1-radio img')[src = '../img/ico_xuanze.png'])
						$("footer p span").eq(2).text("0.00")
						var onlineId = $(this).attr("onlineId")
						//移除购物车中缓存上架商品信息
						operationShoppingCartLocalSession(onlineId, 3)
					}
				})
				if (i % 2 == 1) {
					i++
					$("footer .click1 img").attr("src", "../img/icoWeixuanze@2x.png")
				}
				var obj = bianlishuju()
				e = 0
	      })
	})

	// 下单''
	$(".xia").click(function () {

		var obj = bianlishuju()
		// 先校验选中了不能下单的商品

		if (obj.xiadan == 1) {
			$.toast("选中了不能下单的商品")
		} else {
			if (obj.arr.length == 0) {
				$.toast("请选择商品")
			} else {
				// 这是本地下单缓存
				setLocalSession("localOrderSession", JSON.stringify(obj.arr))
				if(obj.arr1!=null&&obj.arr1.length>0){
					var unCheckShoppingCartLocalSession = {}
					unCheckShoppingCartLocalSession.body = obj.arr1
					setLocalSession("unCheckShoppingCartLocalSession", JSON.stringify(unCheckShoppingCartLocalSession))
				}else{
					setLocalSession("unCheckShoppingCartLocalSession", "")
				}
				//跳转到 下单页面
				xhq.gotoUrl('../html/order.html',{mallType:'gwcgm',sourceType:'3',channelType:'1'});
			}
		}
	})

	$(".content-block .content-block1 img").click(function () {
		$(".content-block1").hide()
	})

}









