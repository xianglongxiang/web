/**
 * index 页面功能
 * @author xianglx@cstonline.com
 * @date: 2015-6-28
 */
require.config({
    baseUrl: "",
    paths: {
        "jquery": ["javascripts/jquery-1.8.3"],
        "ejs": ["javascripts/ejs_production"],
        "base": ["javascripts/base"],
        "common": ["javascripts/common"],
        "page-config": ["js/page-config"],
        "nav-left": ["js/nav-left"],
        "back-top": ["js/back-top"]
    },
    shim: {
        "back-top": ["jquery"],
        "nav-left": ["jquery","common"]
    }
})
require(["jquery","ejs","base","common","page-config","nav-left","back-top"],function(){
    global.lx.navLeft();
});
