/**
 * Created by xze on 15/3/11.
 * Zepto的替代品，纯手工制作～超小体积，应对印度阿三烂网络的神器！～包含用到的Zepto的各种功能的阉割版本
 */
// 缓存document对象，省代码 = =#
(function(){
var DOC = document;

var commonFuncs = {
    isStrNum: function( obj ) {
        var type = typeof obj;
        return type == 'number' || type == 'string';
    },
    // querySelectorAlll方法的缩略
    qsa: function( elem, selector, onlyOne ) {
        if( typeof elem == 'string' ) {
            onlyOne     = selector;
            selector    = elem;
            elem        = DOC;
        }
        try {
            var result = elem[ 'querySelector' + (onlyOne ? '' : 'All') ](selector);
        } catch(e) {
            result = [];
        }

        return result;
    },
    isElemType: function( node, typeIdList ) {

        var type = node && node.nodeType,
            is;

        if( type )
            typeIdList.every(function ( n ) {
                // 匹配上则返回false终止循环
                return !(is = (n == type));
            },true );

        return is;

    },
    isElem: function(node) {
        return this.isElemType( node, [1,9,11] );
    },
    match: function( elem, selector ) {

        var MATCHES_SELECTOR = 'MatchesSelector';
        var match,
            matchesSelector;

        // 过滤无效selector，非ELEMENT_NODE(数字1)类型的元素
        if ( !selector || !commonFuncs.isElemType(elem,[1]) ) return null;

        // 省代码写法
        ['webkit','','moz','o'].every(function( n ) {
            return !(matchesSelector = elem[ n+MATCHES_SELECTOR ])
        });
        // 原本代码如下
//        var matchesSelector = elem.webkitMatchesSelector || elem.mozMatchesSelector ||
//            elem.oMatchesSelector || elem.matchesSelector;

        if (matchesSelector)
            match = matchesSelector.call( elem, selector );

        else {
            // 降级方法
            var parent = elem.parentNode,
                temp = !parent;

            if (temp) {
                var tempParent = DOC.createElement('div');
                (parent = tempParent).appendChild(elem);
            }
            var queryResult = [].slice.call(this.qsa(parent, selector));

            match = !!~queryResult.indexOf(elem);
            temp && tempParent.removeChild(elem);
        }

        return match? elem: null;

    },
    // 获取符合selector条件的祖先元素
    ancestor: function( elem, selector ) {
        var curNode = elem;
        while( curNode = curNode.parentNode ) {
            if( this.match( curNode, selector ) )
                return curNode;
        }
        return null;
    },
    // 转换字符为对应的DOM对象集合
    str2dom: function( str, strict ) {

        var container = DOC.createElement('div');

        // 严格模式，且传入字符不符合HTML特征，所以返回空的元素集合
        if( strict && !/<[\w\/].*?>/.test(str) )
            return container.childNodes;

        var wrapMap = {
            option: [ 1, '<select multiple="multiple">',        '</select>' ],
            legend: [ 1, '<fieldset>',                          '</fieldset>' ],
            area:   [ 1, '<map>',                               '</map>' ],
            param:  [ 1, '<object>',                            '</object>' ],
            thead:  [ 1, '<table>',                             '</table>' ],
            tr:     [ 2, '<table><tbody>',                      '</tbody></table>' ],
            col:    [ 2, '<table><tbody></tbody><colgroup>',    '</colgroup></table>' ],
            td:     [ 3, '<table><tbody><tr>',                  '</tr></tbody></table>' ]
        };
        var matchResult = /[\s\n]*<(\w+?)/.exec(str),
            wrap        = matchResult && wrapMap[ matchResult[1] ] || [0,'',''],

            count       = wrap[0],
            wrapLeft    = wrap[1],
            wrapRight   = wrap[2];


        container.innerHTML = wrapLeft +str+ wrapRight;

        for( var i = count; i; i-- )
            container = container.lastChild;

        return container.childNodes;

    },
    // 驼峰化字符串
    camelize: function ( s ) {

        try {
            var ret = s.replace(/[-_]([a-z])/g, function (all, letter) {

                return letter.toUpperCase();

            });
        } catch(e) {
            ret = s;
        }

        return ret;

    },

    // set or get cookie
    cookie: function( name, val, props ) {


        if( !name )
            return false;

        if( val === undefined ) {

            var cookieList = document.cookie.split(";");

            for( var i in cookieList ) {

                var keyValue = cookieList[i].replace( /(^\s*)|(\s*$)/g, "" ).split("=");

                if( keyValue[0] == name )
                    return keyValue[1];

            }

            return null;

        }

        var str = name + "=" +val;

        // 附加参数
        props = props || {};
        // expires过期时间，单位：天
        if( props.expires ) {
            var date = new Date();
            date.setDate( date.getDate() + props.expires );
            str += ";expires=" + date.toGMTString();
        }

        // 路径，默认 `/` 根路径
        str += ";path=" + ( props.path || "/" );

        // 域名
        if( props.domain )
            str += ";domain=" + props.domain;

        // 是否https传输
        if( props.secure )
            str += ";secure";


        document.cookie = str;

        return true;

    },

    ajax : function ( options ) {

            function serialize( data ) {

                var s = [];

                if( window.FormData && data instanceof FormData )
                    return data;

                for(var item in data){
                    s.push(item + "=" + data[item]);
                }

                return s.join("&");
            }

            var xhr =  new XMLHttpRequest();

            var method = (options.method || 'GET').toUpperCase();

            var url             = options.url,
                data            = options.data,
                headers         = options.headers,
                successCallback = options.success,
                errorCallback   = options.error,
                timeout         = options.timeout,
                timeoutTimer,
                isTimeOut = false

            if( data ) {
                data = serialize(data);
            }

            if( method == "GET" && data ) {
                if(url.indexOf("?")==-1){
                    url += "?" + data;
                }else{
                    url += "&" + data;
                }
            }

            xhr.onreadystatechange = function () {
                if( xhr.readyState == 4 && !isTimeOut ) {

                    if( timeoutTimer )
                        clearTimeout(timeoutTimer);

                    var statusCode  = xhr.status,
                        str         = xhr.responseText;
                    if( statusCode<200 || statusCode>=400 ) {
                        if( errorCallback ) {
                            errorCallback( xhr, 'status error' );
                        }
                    }

                    else if( successCallback )
                        successCallback( str, xhr.status, xhr );
                }
            }

            xhr.open( method, url );

            if( method == "POST" && typeof data == 'string' )
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            if( headers )
                for( var k in headers )
                    xhr.setRequestHeader( k, headers[k] );

            if( timeout && typeof timeout == 'number' ) {
                timeoutTimer = setTimeout(function() {
                    isTimeOut = true
                    if( errorCallback ) {
                        errorCallback( xhr, 'timeout' );
                    }
                    xhr.abort();
                }, timeout);
            }

            xhr.send( data );

            return xhr;
        },
        get : function(url,data,callback) {

            var options = {url:url};

            if( typeof data == 'function' )
                options.success = data;
            else {
                options.data        = data;
                options.success     = callback;
            }

            this.ajax(options);
        }


};

var SBuilder = function( selector ) {
    return new S( selector || {} );
};
SBuilder.cookie = commonFuncs.cookie;
SBuilder.ajax   = commonFuncs.ajax;
SBuilder.get    = commonFuncs.get;
SBuilder.match  = commonFuncs.match;


// 构造方法
var S = function( selector ) {

    var self = this;
    self.length = 0;

    // 字符串
    if( typeof selector == 'string' ) {

        // 去掉换行符
        selector.replace( /\n/g, '' );

        // 尝试以严格模式转成DOM对象集合
        var doms = commonFuncs.str2dom( selector, true );
        // 成功转成DOM对象
        if( doms.length>0 ) {
            S.call(self, doms);

        }
        else {
            doms = commonFuncs.qsa( selector );
            S.call( self, doms );
        }

    }

    if(!selector)
        return;

    // 数组or伪数组
    else if( selector[0] && (commonFuncs.isElemType(selector[0],[1,3,9,11]))/* 判断是否HTML元素（包括文本元素NodeType=3） */ ) {
        for( var i=0,count=0,l=selector.length; i<l; i++ ) {
            if (commonFuncs.isElem(selector[i])) {
                self[count] = selector[i];
                count++;
            }
        }
        self.length = count;
    }
    // 单个DOM元素
    else if( commonFuncs.isElem(selector) || window===selector ) {
        this[0] = selector;
        this.length = 1;
    }
};

// 原型方法
S.fn = S.prototype = {

    each: function( callback ) {
        var self = this;

        for( var i= 0,l=self.length; i<l; i++ ) {
            callback.call( self[i], i, self[i] );
        }

        return self;
    },
    children: function( selector ) {
        var result = [];

        this.each(function( index, node ) {


            for( var i in node.childNodes ) {

                var n = node.childNodes[i];

                if( !selector || commonFuncs.match( n, selector ) )
                    result.push(n);

            }

        });

        return new S(result);
    },
    on: function( eventType, callback, removeMode ) {
        return this.each( function( index, node ) {
            node[ (removeMode? 'remove': 'add')+'EventListener' ]( eventType, callback );
        });
    },
    off: function( eventType, callback ) {
        return this.on( eventType, callback, true );
    },
    click: function(callback) {
        return this.on( 'click', callback );
    },
    trigger: function( eventType, extraParams ) {

        var event = DOC.createEvent('Events');
        event.initEvent( eventType, true, true );

        if (extraParams) {
            for( var k in extraParams ) {
                event[k] = extraParams[k];
            }
        }

        return this.each(function( index, node ){
            node.dispatchEvent(event);
        });
    },
    delegate: function( filterSelector, eventType, callback ) {

        return this.on( eventType, function(e) {

            var targetElem = e._hack_target || e.target;

            var matchElem   = commonFuncs.match( targetElem, filterSelector );
            if( !matchElem )
                matchElem   = commonFuncs.ancestor( targetElem, filterSelector );

            if (matchElem)
                callback.call( matchElem, e );

        });

    },
    // 阉割版的show方法（假定所有被show的元素都是block呈现）
    show: function( display ) {
        return this.each( function( index, node ) {
            node.style.display = display || 'block';
        });
    },
    hide: function() {
        return this.each( function( index, node ) {
            node.style.display = 'none';
        });
    },
    focus: function() {
        var node = this[0];
        if( node && node.focus )
            node.focus();
        return this;
    },
    last: function() {
        return new S(this[ this.length-1 ]);
    },
    val: function( val ) {
        var node = this[0];
        if( val!==undefined && node )
            node.value = val;
        else
            return node && node.value;

        return this;
    },
    offset: function() {
        var node = this[0],
            left = 0, top = 0;

        if (node) {
            do {
                left += node.offsetLeft || 0;
                top  += node.offsetTop || 0;
            }
            while ((node = node.offsetParent) != DOC.body && node);
        }

        return {
            left:left,
            top:top,
            width:this.width(),
            height:this.height()
        };
    },
    hasAttr: function( key ) {
        return this[0] && this[0].hasAttribute(key);
    },
    attr: function( key, val ) {
        var self = this;
        if( typeof val != 'undefined' ) {
            return self.each(function (index, node) {
                node.setAttribute(key, val);
            });
        }
        else
            return self[0] && self[0].getAttribute(key);
    },
    removeAttr: function( key ) {
        return this.each(function( index, node ) {
            node.removeAttribute(key);
        });
    },
    _operateClass: function( name, mode ) {

        // 支持逗号分隔批量操作
        name = name.split(",");

        var ret = true;

        // 查询并遍历目标元素
        this.each( function ( i, node ) {

            //遍历要操作的class名称集合
            for( var i in name ) {
                if(
                    false === (function (i, n) {
                        var cn = node.className || "";
                        // 移除
                        if (mode == "r") {
                            var reg = new RegExp("\\s*\\b" + n + "\\b\\s*");
                            node.className = cn.replace(reg, " ").replace(/(^\s*)|(\s*$)/g, '');
                        }
                        // 检测
                        else if (mode == "t" && !new RegExp("\\b" + n + "\\b").test(cn)) {
                            ret = false;
                            return false;
                        }
                        // 设置
                        else if ( !new RegExp("\\b" + n + "\\b").test(cn) ) {
                            node.className += (cn.length < 1 ? "" : " ") + n;
                        }
                    })( i, name[i] )
                ) break;
            }

        });

        return ret;
    },
    addClass: function( className ) {
        this._operateClass( className );
        return this;
    },
    removeClass: function( className ) {
        this._operateClass( className, 'r' ); // remove
        return this;
    },
    hasClass: function(className) {
        return this._operateClass( className, 't' ); // test
    },
    // 阉割版的css方法，不提供智能的单位(px,pt等)补充
    css: function( key, val ) {

        key = commonFuncs.camelize(key);

        if( val != undefined ) {
            if( typeof val == 'number' ) val = val+'px';
            return this.each( function( index, node ) {
                node.style[key] = val;
            });
        }
        else {
            try {
                var ret = DOC.defaultView.getComputedStyle(this[0])[key];
            } catch(e) {}

            return ret;
        }
    },
    cssNoUnit: function( key ) {
        var ret = this.css(key);
        return typeof ret == 'string'? parseInt(ret.replace(/(\d+)\w*/, "$1")) : ret;
    },
    append: function( selector ) {
        var node = this[0];
        if (!node) return this;

        var S_Target = new S(selector);
        S_Target.each(function( index, targetNode ) {
            node.appendChild(targetNode);
        });

        return this;
    },
    prepend: function( selector ) {
        var node = this[0];
        if (!node) return this;

        var S_Target = new S(selector);
        var firstChild = node.firstChild;
        S_Target.each(function (i, targetItem) {
          node.insertBefore( targetItem, firstChild );
        });

        return this;
    },
    before: function (selector) {
        var node = this[0];

        if (!node) return this;

        var S_Target = new S(selector);
        S_Target.each(function (index, targetNode) {
            var parent = node.parentNode;
            parent.insertBefore(targetNode, node);
        });

        return this;
    },
    after : function(selector) {
        var node = this[0];

        if (!node) return this;

        var S_Target = new S(selector);
        S_Target.each(function (index, targetNode) {
            var parent = node.parentNode;
            if (parent.lastchild == node) {
                parent.appendChild(targetNode);
            }
            else {
                parent.insertBefore(targetNode, node.nextSibling);
            }
        });

        return this;
    },
    remove: function() {
        this.each(function( index, node ){
            var parentNode = node.parentNode;
            if( parentNode ) {
                parentNode.removeChild(node);
            }
        });
    },
    index: function() {

        var node = this[0];
        var parentNode = node && node.parentNode;

        if( parentNode ) {

            var childNodes = parentNode.childNodes;
            var count = 0;
            for( var i in childNodes ) {
                if( node === childNodes[i] ) break;
                else if( commonFuncs.isElem(childNodes[i]) ) count++;
            }

            return count;
        }
        else
            return null;
    }
};

[
    [ 'next', 'next' ],
    [ 'prev', 'previous' ]
].forEach(function( props ) {

    var method = props[0],
        targetProp = props[1] + 'ElementSibling';

    S.fn[method] = function( selector ) {
        var self = this,
            node = self[0];

        if (!node) return new S();

        if (!selector) selector = 1;

        if( typeof selector == 'number' ) {

            while( selector-- && (node = node[targetProp]) );

        }
        else {
            while(node = node[targetProp]) {
                if(commonFuncs.match( node, selector ))
                    break;
            }
        }

        return new S(node);

    };

});

// find
// 方法的省代码方式扩展
[
    ['find',    function( node, selector ) {return commonFuncs.qsa( node, selector );}],
    [
        'parent',
        function( node, selector ) {
            if(!selector) return node.parentNode;
            else if (typeof selector == 'number') {
                var curNode = node;
                while(curNode && selector--)
                    curNode = curNode.parentNode;

                return curNode;
            }
            else return commonFuncs.ancestor( node, selector );
        }
    ]
].forEach(function( props ) {
        var method = props[0],
            nodesGetterFn = props[1];

        S.fn[ method ] = function( selector ) {
            var res = [];
            this.each(function( index, node ) {
                var nodes = nodesGetterFn( node, selector );
                new S(nodes).each(function(i,n) {
                    res.push(n);
                });
            });

            return new S(res);
        };

    });

// text,html方法的省代码方式扩展
[
    ['text','Text'],
    ['html','HTML']
].forEach(function( props ) {
        S.fn[ props[0] ] = function( val ) {
            var node = this[0],
                property = 'inner'+props[1];

            if( typeof val == 'number' ) val = val.toString();

            if (typeof val == 'string' && node) {
                this.each(function() {
                    this[property] = val;
                });
                return this;
            }
            else
                return node && node['inner'+props[1]] || null;
        };
    });

// width、height、left、top、innerWidth、innerHeight、outerWidth、outerHeight
// 一堆方法的省代码方式扩展
var props = {
    innerWidth: [
        'width',
        {
            "border-left-width":    1,
            "border-right-width":   1
        }
    ],
    innerHeight: [
        'height',
        {
            "border-top-width":     1,
            "border-bottom-width":  1
        }
    ],
    width: [
        'width',
        {
            "border-left-width":    1,
            "border-right-width":   1,
            "padding-left":         1,
            "padding-right":        1
        }
    ],
    height: [
        'height',
        {
            "border-top-width":     1,
            "border-bottom-width":  1,
            "padding-top":          1,
            "padding-bottom":       1
        }
    ],
    outerWidth:     ['width'],
    outerHeight:    ['height'],
    left:           ['left'],
    top:            ['top'],
    paddingTop:     ['padding-top',     null,   1],
    paddingBottom:  ['padding-bottom',  null,   1],
    paddingLeft:    ['padding-left',    null,   1],
    paddingRight:   ['padding-right',   null,   1]
};
for( var n in props ) {
    (function( args, method) {
        S.fn[method] = function (value) {

            // 设置
            if (commonFuncs.isStrNum(value))
                return this.css(method, value);

            // 获取
            else {
                var node = this[0],
                    property    = args[0],
                    extraProps  = args[1],
                    originally  = args[2];

                if (!node)
                    return null;


                // 获取开始
                var self = this,
                    extra = 0;
                // 计算边框、padding
                for (var k in extraProps) {
                    var delta = extraProps[k];
                    extra += delta * ( self.cssNoUnit(k) || 0 );
                }

                if (originally)
                    var ret = this.cssNoUnit(property);
                else
                    ret = node["offset" + commonFuncs.camelize("-" + property)] - extra;

                return ret;
            }
        };
    })( props[n], n );
}

window.$ = window.$ || SBuilder;

})();