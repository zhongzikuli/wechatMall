var last;

$(function () {
	if (xhq.getQuery("isWs") == 1){
		$("searchForm").attr("action","ws_search_result.html?"+xhq.getVersion());
	}else{
		$("searchForm").attr("action","search_result.html?"+xhq.getVersion());
	}
	
	// 从缓存中读取最近10次搜索记录:是一个数组对象 [aaaaa|bbbb|cccc|dddd]
	var lastStr = getLocalSession("search_records") || "";
	if (lastStr == "")
		last = [];
	else
		last = lastStr.split("|");
	if (last.length == 0){
	}else{
		var html="";
		for(var i=0;i<last.length;i++){
			html +='<li class="recent_list" data='+last[i]+'><a>'+last[i]+'</a></li>';
			
		}
		$('.list-block').html(html);
	}

	$('.list-block').on('tap','li',function(){
		var s = $(this).attr("data");
		if (xhq.getQuery("isWs") == 1){
			xhq.gotoUrl("ws_search_result.html",{keyword:s});
		}else{
			xhq.gotoUrl("search_result.html",{keyword:s});
		}
		return;
	});
	
	var param = xhq.getQuery("keyword") || "";
	$("#search_record").val(param);
})



