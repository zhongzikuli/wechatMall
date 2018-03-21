$(document).ready(function () {
	var shoppingcartLocalSession = {};
	
	//存放地址缓存信息‰
	//setLocalSession("shoppingCartLocalSession", '{"body":[{ "showName": "llllgasadsadsadsadasdsaasfasdfasdfsadfsadfsadsafsadfsdfsafsafsd", "money": 200, "salePrice": 2000, "onlineId": 5,"bigPic": "http://file.cdn.xiaohongquan.cn/20161130/a5ca1b2626774fc709347fe0e0093496.jpg","mailMoney": 220, "fullName": "tang3 214 31", "goodId": 6, "purchasePrice": 2000, "num": 2},{"showName": "hkliiytrterewe3wwdsddsd", "money": 800,"salePrice": 600, "onlineId": 6,"channel": 1,   "bigPic": "http://file.cdn.xiaohongquan.cn/20161130/a5ca1b2626774fc709347fe0e0093496.jpg  ","mailMoney": 300, "fullName": "T23 T1Gsdf DG", "goodId": 7,  "purchasePrice": 600,"num": 3 }]}');
	setLocalSession("shoppingCartLocalSession","");
	//获取地址缓存信息
	//var shopingCartSession = JSON.parse(getLocalSession("shoppingCartLocalSession"));
	//查询地址的信息
	var param = { interId: 'toc.getCheckGoodsIsOnline', channel: 'C', onlineIds: '8' };

	
	xhq.__runXHQ(param, function (data) {
		// 检测返回值
		if (data.status == 0) {

			$("#mailList").html(mailList);
			//获取免邮费金额
			var param = { interId: 'toc.getAvoidExpressFee', channel: 'C' };
			xhq.__runXHQ(param, function (data) {
			$("#avoidExpressFee").val(data.body.avoidExpressFee);
			setLocalSession("avoidExpressFee", data.body.avoidExpressFee);
			
			});
			kaishi()
			
		} else {
			$.toast(data.message);
		}
	});

})

kaishi()
function kaishi(){
    var obj1 = {}
    $(".address").each(function(){
        $(this).find(".bianji").click(function(){
           var addressName = $(this).parents(".address").find(".addressName").text()
           var addressPhoneNo =  $(this).parents(".address").find(".addressPhoneNo").text()
           var addressAttr =  $(this).parents(".address").find(".addressAttr").text()
           var obj = {
               addressName:addressName,
               addressPhoneNo:addressPhoneNo,
               addressAttr:addressAttr
           }
           
           setLocalSession("addressbianji",JSON.stringify(obj));
           xhq.gotoUrl("address_edit.html");
        obj1 =obj
    $("#youname").val(obj1.addressName)
    $("#youphone").val(ob1.addressPhoneNo)
    $("#picker-name").val(obj1.addressAttr)

        })

    })



    // 新增
    $("footer").click(function(){
    	xhq.gotoUrl("address_register.html");
    })
// 选择地址
$("#picker-name").picker({
  toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker">确定</button>\
  <h1 class="title">请选择称呼</h1>\
  </header>',
  cols: [
    {
      textAlign: 'center',
      values: ['赵', '钱', '孙', '李', '周', '吴', '郑', '王']
      //如果你希望显示文案和实际值不同，可以在这里加一个displayValues: [.....]
    },
    {
      textAlign: 'center',
      values: ['杰伦', '磊', '明', '小鹏', '燕姿', '菲菲', 'Baby']
    },
    {
      textAlign: 'center',
      values: ['先生', '小姐']
    }
  ]
});
}