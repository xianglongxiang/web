/**
 * Created by xlx on 2016/3/15.
 */
(function(w, $) {
    var devDoc = {
        contentBody: null,
        init: function(){
            $("#menu li>ul,.nav>ul").hide();
            $("#menu .show>ul").show();
            $(".nav").click(devDoc.switchLeftNav);
            $("#menu .doc,#menu li li").click(devDoc.switchRightContent);
            $(".content").delegate(".hide-menu","click",devDoc.switchMenu);
            $(".content").delegate("img","dblclick",devDoc.browserBig);
            devDoc.contentBody = $("#content-body");
            var url = devDoc.getUrl();
            var parentId = devDoc.getParam("parent");
            var navUrl = url;
            if(parentId){
                navUrl = pages[parentId].url;
            }
            devDoc.showNav(navUrl);
            devDoc.contentBody.load(url,function(){
                devDoc.anchorPoint();
            });
        },
        /*
         * 切换左边菜单显示
         * @param url 需要显示的地址
         * */
        showNav: function(url){
            var that = $(".doc[data-url='" + url + "']");
            var nav = that.parents("ul");
            $(".active").removeClass("active");
            $(".show").find(".twoMenu").hide();
            $(".show").removeClass("show");
            that.addClass("active");
            if(nav.length>0){
                that.parents(".twoMenu").parents("li").addClass("show");
                nav.show();
            }
        },
        //切换页面导航显示
        switchMenu: function(){
            $(".nav_list").slideToggle("fast",function(){
                if($(this).is(":hidden")){
                    $(".hide-menu a").html("显示");
                } else {
                    $(".hide-menu a").html("隐藏");
                }
            })
        },
        //左边菜单栏展示
        switchLeftNav: function(){
            var that = $(this);
            var parentDom = that.parent();
            var isShow = parentDom.hasClass("show");
            if (isShow) {
                parentDom.removeClass("show");
            } else {
                parentDom.addClass("show");
            }
            var ul = parentDom.find("ul").eq(0);
            ul.slideToggle();
        },
        //右边内容展示
        switchRightContent: function(){
            var that = $(this);
//            var url = that.attr("data-url");
            var page_index = that.attr("data-index");
            var isShow = function(){
                var pageID = devDoc.getParam("page");
                return page_index == pageID;
            }();
            var hasChild = function(){//true 没有下级菜单
                return that.find("ul").length == 0;
            }();
            if(!isShow && hasChild){//没有展开且不包含下级菜单
//                $("#menu .active").removeClass("active");
//                that.addClass("active");
//                devDoc.contentBody.load(url);
                location.href = "devdoc.html?page="+page_index;

            }
        },
        /*
         * 页面锚点跳转
         * param md 页面跳转位置的id
         * */
        anchorPoint: function(md){
            var action = devDoc.getParam("action");
            if(action){
                md = md || action.split("#")[0];//获取页面锚点
                location.hash = "";
                location.hash = md;
            }
        },
        getUrl: function(){
            var address ;
            if(devDoc.getParam("page")){
                var page = devDoc.getParam("page").split("#")[0];
                address  =  pages[page].url;
            } else {
//                address  =  pages["1"].url;
                address  =  pages["1"].url;
            }
            return address;
        },
        /*
         * 获取路径当中的值
         * @param 传入获取值对应的key
         * @return 返回获取到的值或false
         * */
        getParam: function(key){
            var val = false;
            try{
                var url = location.href.split("?")[1];
                var params = url.split("&");
                var len = params.length;
                for (var i=0; i< len; i++){
                    var param = params[i].split("=");;
                    var k = param[0];
                    var v = param[1];
                    if (k == key){
                        val = v;
                        break;
                    }
                }
            }catch(e){}
            return val;
        },
        //放大图片展示
        browserBig: function () {
            var that = $(this);
            var src = that.attr("src");
            var img = new Image();
            img.src = src;
            img.onload = function(){
                var width = img.width;
                var height = img.height;
                var dh = document.documentElement.clientHeight;
                height = height > dh ? dh * 0.9 : height;
                var index1 = layer.open({
                    type: 2,
                    title: "",
                    shadeClose: true,
                    shade: 0.8,
                    area: [width + "px", height + "px"],
                    content: src
                });
                layer.style(index1, {
                    marginTop: "0px",
                    maxWidth:"80%",
                    maxHeight:"80%"
                })
            }
        }
    }
    w.onload = devDoc.init;
    w.devDoc = devDoc;
})(window, jQuery);