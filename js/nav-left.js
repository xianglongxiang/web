/**
 * nav-left 左边导航
 * @author xianglx@cstonline.com
 * @date: 2015-6-28
 */
(function(win,doc){
    var _self;
    var _navLeft = {
        contentBody: "",
        init:function(){
            _self = _navLeft;
            var _navHtml = new EJS({url: 'templ/nav-left.ejs'}).render({});
            document.getElementsByClassName("nav-left")[0].innerHTML = _navHtml;
            $(".menu-title").click(_self.switchLeftNav);
            $(".doc").click(_self.switchRightContent);
            _self.contentBody = $("#content-body");
            var pageId = global.lx.getUrlParam("page");
            var parentId = global.lx.getUrlParam("parent");
            var url = _self.getUrlToShow(pageId);
            var navId = pageId;
            if(parentId)navId = parentId;
            _self.showNav(navId);
            _self.contentBody.load(url, function(){
                _self.anchorPoint();
            });
        },
        //获取展示页的路径
        getUrlToShow: function(pageId){
            var address = "";
            try{
                if(pageId){
                    pageId = pageId.split("#")[0];
                    address  =  pages[pageId].url;
                } else {//没有page，默认打开首页
                    address  =  pages["1"].url;
                }
            }catch (e){}
            return address;
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
            var page_index = that.attr("data-index");
            var isShow = function(){
                var pageID = global.lx.getUrlParam("page");
                return page_index == pageID;
            }();
            var hasChild = function(){//true 没有下级菜单
                return that.find("ul").length == 0;
            }();
            if(!isShow && hasChild){//没有展开且不包含下级菜单
                location.href = "index.html?page="+page_index;
            }
        },
        /*
         * 切换左边菜单显示
         * @param url 需要显示的地址
         * */
        showNav: function(pageId){
            var that = $(".doc[data-index='" + pageId + "']");
            var nav = that.parents("ul");
            $(".active").removeClass("active");
            $(".show").find(".twoMenu").hide();
            $(".show").removeClass("show");
            that.addClass("active");
            if(nav.length>0){
                that.parents(".twoMenu").parents("li").addClass("show");
                nav.show();
            }
        }
    };
    win.global.lx.navLeft = _navLeft.init;
})(window,document);