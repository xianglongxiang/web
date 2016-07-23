/**
 * back-top 返回首页
 * @author xianglx@cstonline.com
 * @date: 2015-6-28
 */
(function(win,$){
    var scroll = {
        show: function(){
            if((document.body.scrollTop || document.documentElement.scrollTop) > 100){
                $(".backTop").show();
            }else{
                $(".backTop").hide();
            }
        },
        backTop: function(){
            $("body,html").animate({
                scrollTop:"0px"
            },500);
        }
    }
  //  document.getElementsByClassName("backTop")[0].onclick = scroll.backTop;
    //win.onscroll = scroll.show;
})(window,jQuery)