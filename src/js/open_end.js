// 倒计时跳转
var t=5;//设定跳转的时间
setInterval("refer()",1000); //启动1秒定时
function refer() {
    if (t == 0) {
        xhq.gotoUrl("home.html",{mode:1});
    }
    document.getElementById('cut_time').innerHTML = "" + t + "秒后自动跳转……"; // 显示倒计时
    t--;    //计数器递减
}
