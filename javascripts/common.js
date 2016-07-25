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
    _global.doSave = function(value, type, name){
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
}(window,document)


