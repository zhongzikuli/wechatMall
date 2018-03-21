// 缓存的格式为：
// {body:[{showName:1111,money:10,salePrice:122,onlineId:100,bigPic:xxxx,goodId:300,mailMoney:10,purchasePrice:120,num:5}]}

// 添加购物车缓存公共
function addCartPub(cartJson){
	// 先取得购物车原来已保存的信息
	var oldShoppingCart = getLocalSession("shoppingCartLocalSession");	
	var shoppingCart;
	// 如果原有缓存，则判断原缓存中是否存在本商品，同直接增加数量
	if (oldShoppingCart != null && oldShoppingCart != undefined && oldShoppingCart.search('{') != -1){
		var thisShoppingCart = JSON.parse(oldShoppingCart);
		var body = thisShoppingCart.body;
		var exist = false;
		if (body && body.length){
			for(var i in body){
				if (body[i].onlineId == cartJson.onlineId){
					body[i].num += parseInt(cartJson.num);
					exist = true;
				}
			}

			if (!exist){
				body[body.length] = cartJson;
			}
			shoppingCart={'body':body};
		}else{
			body = new Array();
			body[0] = cartJson;
			shoppingCart={'body':body};
		}
	}else{
		body = new Array();
		body[0] = cartJson;
		shoppingCart={'body':body};
	}

	var json = JSON.stringify(shoppingCart);
	setLocalSession("shoppingCartLocalSession", json);
	$.toast('添加成功，在购物车等亲');
	return shoppingCart.body.length;
}

//添加下单缓存公共
function refreshOrderCache(orderJson){
	var body = new Array();
	body[0] = orderJson;
	var json = JSON.stringify(body);
	setLocalSession("localOrderSession", json);
}

// 不适用于拼团业务
function gotoBuyPub(channel, fromCustId){
	var param;
	if (channel == 1){
		if (!fromCustId){
			// 非分享通用商品下单
			param = {mailType:'lkgm',sourceType:3,channelType:1};
		}else{
			// 通用上架分享下单
			param = {mailType:'lkgm',sourceType:2,sourceId:fromCustId,channelType:1};
		}
	}else if (channel == 2){
		if (!fromCustId){
			// 非分享一元置换商品下单
			param = {mailType:'lkgm',sourceType:3,channelType:2};
		}else{
			// 分享一元置换商品下单
			param = {mailType:'lkgm',sourceType:2,sourceId:fromCustId,channelType:2};
		}
	}
	xhq.gotoUrl("order.html",param);
}