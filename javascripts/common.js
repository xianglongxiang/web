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
     * @return 返回获取到的值或false
     *
     * */
    _global.getUrlParam = function(key){
        var val = 1;
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
    }
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
        if(file.files&&file.files[0])
            return window.URL.createObjectURL(file.files[0]);
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
        var anchor = document.createElement("a");
        if ('download' in anchor) {
            anchor.style.visibility = "hidden";
            anchor.href = bloburl;
            anchor.download = name;
            document.body.appendChild(anchor);
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            anchor.dispatchEvent(evt);
            document.body.removeChild(anchor);
        } else if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        } else {
            location.href = bloburl;
        }
    }
    win.global  = _global.lx = _global;
})(window, document);

