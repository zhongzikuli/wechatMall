/**
 * Created by holmes on 2017/1/11.
 */


//团长进来，此团购结束，'倒计时'文字 变成了'此团购结束'
$(function () {
    var text_boxHtml='<div class="text_box none">仅剩<span class="span_f">1</span>个名额<br>此拼团已结束 </div>'
    $('.text_box').html(text_boxHtml);
});

//团长进来，此团购有效，'此团购结束'文字 变成了'倒计时'
$(function () {
    var text_boxHtml='<div class="text_box ">仅剩<span class="span_f">1</span>个名额<br>剩余<span class="span_s">22:15:16</span>结束 </div>';
    $('.text_box').html(text_boxHtml);
});