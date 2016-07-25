/**
 * index 页面功能
 * @author xianglx@cstonline.com
 * @date: 2015-6-28
 */
(function(win,doc){
    'use strict';
    var _global = {};
    /**
     * 获取路径当中的值
     * @param 传入获取值对应的key
     * @return 返回获取到的值
     * */
    _global.getUrlParam = function(key){
        /**
         * 这里的双引号和后面的表达式冲突，替换
         * */
        var url = decodeURIComponent(location.href).replace(/\"/g, "'");
        /**
         * 将url replace成json
         * */
        return JSON.parse("{\"" + url.split("?")[1].replace(/\&/g,",").replace(/\=/g,":").replace(/\:/g,"\":\"").replace(/\,/g, "\",\"") + "\"}")[key];
    },
    /**
     * 阻止默认事件
     * */
    _global.stopDefault = function(e){
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }
    }
    /**
     * 获取[File] 名称
     * */
    _global.getFileName = function(file){
        return file.value;
    }
    /**
     *  获取[File] 路径 blob
     *  @return [string]
     * */
    _global.getFileUrl = function(file){
        if(file.files&&file.files[0])return window.URL.createObjectURL(file.files[0]);
        file.select();
        return doc.selection.createRange().text;
    }
    /**
     *  获取[file] 文件大小
     *  @return [int] kb
     * */
    _global.getFileSize = function(file){
        return Math.ceil(file.files[0].size/1024);
    }


    /**
     *  事件绑定
     *  @param element 需要绑定的对象 eg：dom、window
     *  @param type 绑定的时间类型  eg：click、dbclick
     *  @param handler 回调方法
     * */
    _global.addEvent = function(element, type, handler) {
        if(element.addEventListener) {
            addEvent = function(element, type, handler) {
                element.addEventListener(type, handler, false);
            };
        } else if(element.attachEvent) {
            addEvent = function(element, type, handler) {
                element.attachEvent('on' + type, handler);
            };
        } else {
            addEvent = function(element, type, handler) {
                element['on' + type] = handler;
            };
        }
    };

    /**
     *  获取数组最小值
     *  @param arr  数组
     *  @return 数组中的最小值
     * */
    _global.getMinVal = function(arr) {
        return Math.min.apply(Math, arr);
    };
    /**
     * 获取随机码
     * @param num  获取随机码的位数
     * @return 返回随机码
     * */
    _global.getAutoAesKey = function(num){
        var randomStr = "";
        var strArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
            'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C',
            'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'Y', 'Z'];
        for(var i = 0; i< num; i++){
            var index = Math.round(Math.random()*42);
            randomStr += strArray[index];
        }
        return randomStr;
    },

    /**
     * 将后台返回的字符编码，处理成特殊字符
     * @return [String]
     * */
        _global.codeToString = function(str){
        if(!str){
            return "";
        }
        var amp = /(&amp;)/gi, lt = /(&lt;)/gi,gt = /(&gt;)/gi,nbsp = /(&nbsp;)/gi,sq = /(&#39;)/gi,quot = /(&quot;)/gi;
        str = str.replace(amp,"&");
        str = str.replace(lt,"<");
        str = str.replace(gt,">");
        str = str.replace(nbsp," ");
        str = str.replace(sq,"\'");
        str = str.replace(quot,"\"");
        return str;
    }

    /**
     * 格式化时间 yy-mm-dd
     * @param time 时间
     * @return 返回 yy-mm-dd 的时间格式
     * */
    _global.dateFormat = function(time){
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return  year + "-" + month + "-" +day;
    }


    win.global  = _global.lx = _global;
})(window, document);

void function(win,doc){
    var _global = {};
    /**
     * 保存文件，将文件下载到本地
     * @param value 保存的内容
     * @param type 文件内容
     * @param  name 文件名字
     * */
    win.global.lx.doSave = function(value, type, name){
        var blob;
        if (typeof window.Blob == "function") {
            blob = new Blob([value], {
                type: type
            });
        } else {
            var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
            var bb = new BlobBuilder();
            bb.append(value);
            blob = bb.getBlob(type);
        }
        var URL = window.URL || window.webkitURL;
        var bloburl = URL.createObjectURL(blob);
        var anchor = doc.createElement("a");
        if ('download' in anchor) {
            anchor.style.visibility = "hidden";
            anchor.href = bloburl;
            anchor.download = name;
            doc.body.appendChild(anchor);
            var evt = doc.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            anchor.dispatchEvent(evt);
            doc.body.removeChild(anchor);
        } else if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        } else {
            location.href = bloburl;
        }
    }
    win.global  = _global.lx = _global;
}(window,document);
(function(win, doc){
    /**
     * 浏览器通知
     * @param title 标题
     * @param content 提示内容
     * @param iconUrl 通知显示的图片
     * */
    win.global.lx.bNotify = function(content, title, iconUrl) {
        title = title||"驾图开放平台";
        content = content||"您看到此条信息桌面提醒设置成功";
        iconUrl = iconUrl||"http://open.kartor.cn/images/app/basic/appIcon.png";
        if (window.webkitNotifications) {
            //chrome老版本
            if (window.webkitNotifications.checkPermission() == 0) {
                var notif = window.webkitNotifications.createNotification(iconUrl, title, content);
                notif.display = function() {}
                notif.onerror = function() {}
                notif.onclose = function() {}
                notif.onclick = function() {this.cancel();}
                notif.replaceId = 'Meteoric';
                notif.show();
            } else {
                window.webkitNotifications.requestPermission($jy.notify);
            }
        }
        else if("Notification" in window){
            // 判断是否有权限
            if (Notification.permission === "granted") {
                var notification = new Notification(title, {
                    "icon": iconUrl,
                    "body": content
                });
                notification.onshow = function(){
                    console.log("You got me!");
                };
                notification.onclick = function() {
                    window.focus();
                };
                notification.onclose = function(){
                    console.log("notification closed!");
                };
                notification.onerror = function() {
                    console.log("An error accured");
                }
            }
            //如果没权限，则请求权限
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission) {
                    // Whatever the user answers, we make sure we store the
                    // information
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                    //如果接受请求
                    if (permission === "granted") {
                        var notification = new Notification(title, {
                            "icon": iconUrl,
                            "body": content
                        });
                    }
                });
            }
        }
    }

})(window, document);


