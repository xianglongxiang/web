/**
 * 封装一些基础功能
 * @author xianglx@cstonline.com
 * @date: 2015-6-6
 */
(function (win, doc) {
    'use strict';
    var ua = navigator.userAgent;
    var browser = {
        ios: /iphone|ipod|ipad/i.test(ua),
        android: /android/i.test(ua),
        wechat: /micromessenger/i.test(ua),
        weibo: /weibo/i.test(ua)
    };

    function noop() {}

    /**
     * 判断数据类型
     * @param {!*} target 待判断对象
     * @return {boolean}
     */
    function isFunction(target) {
        return Object.prototype.toString.call(target) === '[object Function]';
    }
    function isArray(target) {
        return Array.isArray(target);
    }
    function isArrayLike(target) {
        var len = target.length;
        return isArray(target) || isNumeric(len) && (len - 1) in target;
    }
    function isPlainObject(target) {
        return toString.call(target) === '[object Object]' &&
            !isWindow(target) &&
            Object.getPrototypeOf(target)  == Object.prototype;
    }

    /**
     * 简单封装log，简化书写
     */
    function log() {
        console.log.apply(console, arguments);
    }

    /**
     * 对象属性扩展
     * @param {object} [target = {}] 待扩展对象
     * @param {object} source 扩展源
     * @param {boolean} [deep = false] 是否为深复制
     * @return {object} 扩展以后的对象
     */
    function extend(target, source, deep) {
        var k, v;
        target = target || {};
        deep = deep || false;
        for (k in source) {
            v = source[k];
            if (deep) {
                if (isPlainObject(v) && !isPlainObject(target[k])) {
                    target[k] = {};
                } else if (isArray(v) && !isArray(target[k])) {
                    target[k] = [];
                }
                extend(target[k], v, deep);
            } else if (v !== undefined) {
                target[k] = v;
            }
        }
        return target;
    }

    /**
     * 选择器
     * 内部只是调用了querySelector执行查找，为单一查找
     * 如果需要查找多个节点，应当使用$a()函数
     * 如果是id选择器，使用$id()效率更高
     *
     * @param {string|function} selector 为函数时，绑定到dom加载完成以后执行，否则为css选择器
     * @param {HTMLElement} [context = document] 上下文
     * @return {HTMLElement} 获取到的节点对象
     */
    function $(selector, context) {
        if (!selector) {
            return;
        }
        if (isFunction(selector)) {
            // ready 回调
            if ('DOMContentLoaded' in win) {
                on(doc, 'DOMContentLoaded', selector);
            } else {
                on(win, 'load', selector);
            }
        } else if (selector.nodeType === 9) {
            // document
            return selector;
        } else {
            context = context || doc;
            return context.querySelector(selector);
        }
    }

    /**
     * 调用querySelectorAll查找，参数同$()
     * @return {HTMLCollection} 获取到的对象集
     */
    function $a(selector, context) {
        if (!selector) {
            return;
        }
        context = context || doc;
        return context.querySelectorAll(selector);
    }

    /**
     * 单纯的getElementById的封装
     */
    function $id(selector) {
        if (!selector) {
            return;
        }
        return doc.getElementById(selector);
    }

    /**
     * 绑定事件
     * @param {HTMLElement|Array} nodes 要绑定事件的元素
     * @param {string} types 事件类型
     * @param {function} handler 事件处理函数
     * @param {boolean} [useCapture = false] 是否绑定在事件捕捉阶段
     * @param {boolean} [once = false] 是否为单次事件
     */
    function on(nodes, types, handler, useCapture, once) {
        var tmpHandler;
        nodes = isArray(nodes) ? nodes : [nodes];
        types = types.split(' ');
        useCapture = arguments[3] || false;
        once = arguments[4] || false;
        if (once) {
            tmpHandler = function () {
                handler(arguments);
                un(nodes, types, tmpHandler, useCapture);
            };
        }
        nodes.forEach(function (node) {
            types.forEach(function (type) {
                node.addEventListener(type, handler, useCapture);
            });
        });
    }

    /**
     * 解除事件绑定
     * @param {HTMLElement|Array} nodes 要绑定事件的元素
     * @param {string} types 事件类型
     * @param {function} handler 事件处理函数
     * @param {boolean} [useCapture = false] 是否绑定在事件捕捉阶段
     */
    function un(nodes, types, handler, useCapture) {
        nodes = utils.isArray(nodes) ? nodes : [nodes];
        types = types.split(' ');
        useCapture = arguments[3] || false;
        nodes.forEach(function (node) {
            types.forEach(function (type) {
                node.removeEventListener(node, type, handler, useCapture);
            });
        });
    }

    /**
     * ajax发起前回调
     * @callback beforeHandler
     * @return {?boolean} 可以没有返回值，当有返回值并且为false时，会中断本次请求
     */
    /**
     * ajax成功回调
     * @callback successHandler
     * @param {object|string} resData 后台响应数据，如果配置中设置dataType为json，
     *     会尝试解析json，这时参数对应为object类型
     */
    /**
     * @callback errorHandler
     * @param {string} errorStatus 错误类型('parseerror', 'emptydata', 'timeout', 'abort', 'cancel', ...)
     */

    /**
     * ajax请求
     * @param {object} options 参数配置
     * @param {string} [options.url = '#'] 请求地址
     * @param {string} [options.type = 'GET'] 请求方式(post/get)
     * @param {string} [dataType] 接收数据类型，暂时只对json敏感，指定为json将会尝试解析响应数据
     * @param {string|object} [options.data] 请求参数，可以以对象或字符串的方式提供
     * @param {number} [options.timeout = 3000] 超时时间
     * @param {beforeHandler} [options.before = noop] 请求开始前回调，返回false会终端本次请求
     * @param {successHandler} [options.success = noop] 成功回调
     * @param {errorHandler} [options.error = noop] 失败回调，超时也会执行此回调
     */
    function ajax(options) {
        var key, arrParam, timeoutTimer, reqData, resData;
        //var xhr = new Xhr();
        var xhr = new XMLHttpRequest();
        var defaultOptions = {
            url: '#',
            type: 'GET',
            dataType: '',
            data: '',
            timeout: 30000,
            before: noop,
            success: noop,
            error: noop
        };
        options = extend(defaultOptions, options);
        var beforeHandler = isFunction(options.before) ? options.before : noop,
            successHandler = isFunction(options.success) ? options.success : noop,
            errorHandler = isFunction(options.error) ? options.error : noop;
        reqData = options.data || '';
        if (typeof reqData === 'object') {
            arrParam = [];
            for (key in reqData) {
                arrParam.push(encodeURIComponent(key) + '=' + encodeURIComponent(reqData[key]));
            }
            reqData = arrParam.join('&');
        }
        if (options.type.toUpperCase() !== 'POST') {
            options.url += (options.url.indexOf('?') > -1 ? '&' : '?') + reqData;
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                    timeoutTimer = null;
                }
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    resData = xhr.responseText;
                    log('xhr.responseText: ' + resData);
                    if (resData) {
                        if (options.dataType.toLowerCase() === 'json') {
                            try {
                                resData = JSON.parse(resData);
                            } catch (e) {
                                errorHandler('parseerror');
                                return;
                            }
                        }
                        successHandler(resData);
                    } else {
                        errorHandler('emptydata');
                    }
                } else {
                    errorHandler(xhr.statusText || xhr.cancel ? 'cancel' : 'abort');
                }
            }
        };
        if (beforeHandler() === false) {
            xhr = null;
            errorHandler('cancel');
            return xhr;
        }
        if (options.timeout > 0) {
            timeoutTimer = setTimeout(function () {
                xhr.cancel = true;
                xhr.abort();
                errorHandler('timeout');
            }, options.timeout);
        }
        xhr.open(options.type, options.url, true);
        if (options.type == 'POST') {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        }
        xhr.send(reqData);
        return xhr;
    }

    /**
     * 获取/设置标签属性
     * @param {HTMLElement} node
     * @param {string} name 属性名
     * @param {string} [value] 没有这个参数时为获取属性
     */
    function attr(node, name, value) {
        return 2 in arguments ? node.setAttribute(name, value) : node.getAttribute(name);
    }

    // 暴露接口
    win.browser = browser;
    win.isFunction = isFunction;
    win.isArray = isArray;
    win.isArrayLike = isArrayLike;
    win.isPlainObject = isPlainObject;
    win.log = log;
    win.extend = extend;
    win.$ = $;
    win.$a = $a;
    win.$id = $id;
    win.on = on;
    win.un = un;
    win.ajax = ajax;
    win.attr = attr;
}(window, document));
/**
 * 实现图片延迟加载，可加载img和背景
 * 依赖：
 * 1、data-src 必须，保存图片地址
 * 2、.lazy-src|.lazy-bg 必须，指定需要延迟加载的节点
 *
 * 3、.lazy-loading 可用于设置正在加载时的样式
 * 4、.lazy-loaded 可用于设置加载完成样式
 *
 * @version 0.0.1
 */
(function (global, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        // for requirejs | seajs
        define(function () {
            return factory(global);
        });
    } else if (typeof module === 'object' && typeof exports === 'object') {
        // for commonjs
        module.exports = factory;
    } else {
        // for normal browser
        global.LazyImage = factory(global);
    }
}(window, function (global) {
    'use strict';

    var doc = document;

    /**
     * @callback onload 加载图片成功回调，this指向目标节点
     */
    /**
     * @callback onerror 加载图片失败回调，this指向目标节点
     */

    /**
     * @constructor
     * @param {object} [options] 配置选项
     * @param {HTMLElement|string} options.context 容器，接收节点的引用或者选择器("#id", ".class", ...)
     * @param {number} options.offset 偏移量，会影响可视区域大小
     * @param {onload} options.onload
     * @param {onerror} options.onerror
     */
    function LazyImage(options) {
        /** 默认配置 **/
        this.options = {
            context: doc,
            offset: 0,
            onload: null,
            onerror: null
        };
        /** 可视区域 **/
        this.viewport = null;

        init(this, options);
        this.render();
        var self = this;
        global.addEventListener('scroll', function () {
            self.render();
        });
    }
    LazyImage.prototype = {
        /**
         * 加载图片实现
         * @param {object} [context] 容器
         */
        render: function (context) {
            var nodes, len, i, node, src, position, img;
            var lastIndexInViewport = -1;
            var self = this,
                onload = this.options.onload,
                onerror = this.options.onerror;
            context = context || this.options.context;
            nodes = context.querySelectorAll('.lazy-img, .lazy-bg');
            len = nodes.length;
            if (len < 1) {
                return;
            }
            for (i = 0; i < len; i++) {
                node = nodes[i];
                if (node.classList.contains('lazy-loading')) {
                    continue;
                }
                position = getPosition(node, this.viewport);
                if (position === 0) {
                    src = node.dataset.src;
                    if (!src) {
                        continue;
                    }
                    lastIndexInViewport = i;
                    node.classList.add('lazy-loading');
                    if (node.classList.contains('lazy-bg')) {
                        // 背景
                        (function (target, src) {
                            var img = new Image();
                            img.onload = function () {
                                onloadHandler(target, 'bg', onload);
                            };
                            img.onerror = function () {
                                onerrorHandler(target, onerror);
                            };
                            img.src = src;
                        }(node, src));
                    } else {
                        // 图片
                        node.onload = function () {
                            onloadHandler(this, 'img', onload);
                        };
                        node.onerror = function () {
                            onerrorHandler(this, onerror);
                        };
                        node.src = src;
                    }
                } else if (position > 0 && lastIndexInViewport > -1 && lastIndexInViewport < i) {
                    // 在可视区域下方
                    break;
                }
            }
        }
    };

    function init(obj, options) {
        var offset;
        options = options || {};
        for (var key in options) {
            obj.options[key] = options[key];
        }
        if (typeof obj.options.context === 'string') {
            obj.options.context = doc.querySelector(obj.options.context);
        }
        offset = obj.options.offset || 0;
        obj.viewport = {
            left: 0,
            right: global.innerWidth || boc.body.clientWidth,
            top: 0 - offset,
            bottom: (global.innerHeight || boc.body.clientHeight) + offset
        };
    }

    /**
     * 获取元素相对可视区域的位置
     * @param {object} target 元素节点引用
     * @param {object} viewport 可视区域
     * @return {?object|int} null--隐藏元素；0--在可视区域内；1--在可视区域下方；-1--在可视区域上方
     */
    function getPosition(target, viewport) {
        var box;
        if (target.offsetParent === null) {
            return null;
        }
        box = target.getBoundingClientRect();
        if (box.top > viewport.bottom) {
            return 1;
        }
        if (box.bottom < viewport.top) {
            return -1;
        }
        return 0;
    }

    /**
     * 图片加载成功回调
     * @param {object} target 元素节点引用
     * @param {string} [type='img'] 延迟加载类型('bg|img')
     * @param {onload} [callback] 回调
     */
    function onloadHandler(target, type, callback) {
        if (type && type === 'bg') {
            target.style.backgroundImage = 'url(' + target.dataset.src + ')';
            target.classList.remove('lazy-bg');
        } else {
            target.classList.remove('lazy-img');
        }
        target.dataset.src = null;
        target.classList.remove('lazy-loading');
        target.classList.add('lazy-loaded');
        if (callback) {
            callback.call(target);
        }
    }

    /**
     * @param {object} target 元素节点引用
     * @param {onerror} [callback] 回调
     */
    function onerrorHandler(target, callback) {
        target.classList.remove('lazy-loading');
        if (callback) {
            callback.call(target);
        }
    }

    return LazyImage;
}));
/**
 *  js动画实现方式—requestAnimationFrame
 * */
(function(win, doc) {
    var lastTime = 0;
    var prefixes = 'webkit moz ms o'.split(' '); //各浏览器前缀
    var requestAnimationFrame = win.requestAnimationFrame,
        cancelAnimationFrame = win.CancelAnimationFrame;
    var prefix;
    //通过遍历各浏览器前缀，来得到requestAnimationFrame和cancelAnimationFrame在当前浏览器的实现形式
    for( var i = 0; i < prefixes.length; i++ ) {
        if ( requestAnimationFrame && cancelAnimationFrame ) {
            break;
        }
        prefix = prefixes[i];
        requestAnimationFrame = requestAnimationFrame || win[ prefix + 'RequestAnimationFrame' ];
        cancelAnimationFrame  = cancelAnimationFrame  || win[ prefix + 'CancelAnimationFrame' ] || win[ prefix + 'CancelRequestAnimationFrame' ];
    }
    if (!requestAnimationFrame || !cancelAnimationFrame) {
        requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = win.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    win.requestAnimationFrame = requestAnimationFrame;
    win.cancelAnimationFrame = cancelAnimationFrame;
}(window, document));
(function (win, doc) {
    'use strict';

    var OFFSET_LIMIT = 100;

    var btnToTop = $('.to-top'),
        isBtnVisiable = false;

    if (!btnToTop) {
        return;
    }
    on(win, 'scroll', function () {
        if (doc.body.scrollTop > OFFSET_LIMIT) {
            if (isBtnVisiable) {
                return;
            }
            btnToTop.style.display = 'block';
            isBtnVisiable = true;
        } else {
            btnToTop.style.display = 'none';
            isBtnVisiable = false;
        }
    });
    on(btnToTop, 'click', function () {
        toTop();
    });

    function toTop() {
        var top = doc.body.scrollTop;
        if (top <= 0) {
            return;
        }
        top -= 100;
        if (top <= 0) {
            top = 0;
        }
        scrollTo(0, top);
        requestAnimationFrame(toTop);
    }
}(window, document));
