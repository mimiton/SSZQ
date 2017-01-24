!function(){var t=document,e={isStrNum:function(t){var e=typeof t;return"number"==e||"string"==e},qsa:function(e,n,r){"string"==typeof e&&(r=n,n=e,e=t);try{var i=e["querySelector"+(r?"":"All")](n)}catch(t){i=[]}return i},isElemType:function(t,e){var n,r=t&&t.nodeType;return r&&e.every(function(t){return!(n=t==r)},!0),n},isElem:function(t){return this.isElemType(t,[1,9,11])},match:function(n,r){var i,o,a="MatchesSelector";if(!r||!e.isElemType(n,[1]))return null;if(["webkit","","moz","o"].every(function(t){return!(o=n[t+a])}),o)i=o.call(n,r);else{var s=n.parentNode,u=!s;if(u){var c=t.createElement("div");(s=c).appendChild(n)}var f=[].slice.call(this.qsa(s,r));i=!!~f.indexOf(n),u&&c.removeChild(n)}return i?n:null},ancestor:function(t,e){for(var n=t;n=n.parentNode;)if(this.match(n,e))return n;return null},str2dom:function(e,n){var r=t.createElement("div");if(n&&!/<\w.*?>/.test(e))return r.childNodes;var i={option:[1,'<select multiple="multiple">',"</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"]},o=/[\s\n]*<(\w+?)/.exec(e),a=o&&i[o[1]]||[0,"",""],s=a[0],u=a[1],c=a[2];r.innerHTML=u+e+c;for(var f=s;f;f--)r=r.lastChild;return r.childNodes},camelize:function(t){try{var e=t.replace(/[-_]([a-z])/g,function(t,e){return e.toUpperCase()})}catch(n){e=t}return e},cookie:function(t,e,n){if(!t)return!1;if(void 0===e){var r=document.cookie.split(";");for(var i in r){var o=r[i].replace(/(^\s*)|(\s*$)/g,"").split("=");if(o[0]==t)return o[1]}return null}var a=t+"="+e;if(n=n||{},n.expires){var s=new Date;s.setDate(s.getDate()+n.expires),a+=";expires="+s.toGMTString()}return a+=";path="+(n.path||"/"),n.domain&&(a+=";domain="+n.domain),n.secure&&(a+=";secure"),document.cookie=a,!0},ajax:function(t){function e(t){var e=[];if(window.FormData&&t instanceof FormData)return t;for(var n in t)e.push(n+"="+t[n]);return e.join("&")}var n,r=new XMLHttpRequest,i=(t.method||"GET").toUpperCase(),o=t.url,a=t.data,s=t.headers,u=t.success,c=t.error,f=t.timeout,h=!1;if(a&&(a=e(a)),"GET"==i&&a&&(o+=o.indexOf("?")==-1?"?"+a:"&"+a),r.onreadystatechange=function(){if(4==r.readyState&&!h){n&&clearTimeout(n);var t=r.status,e=r.responseText;t<200||t>=400?c&&c(r,"status error"):u&&u(e,r.status,r)}},r.open(i,o),"POST"==i&&"string"==typeof a&&r.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s)for(var l in s)r.setRequestHeader(l,s[l]);return f&&"number"==typeof f&&(n=setTimeout(function(){h=!0,c&&c(r,"timeout"),r.abort()},f)),r.send(a),r},get:function(t,e,n){var r={url:t};"function"==typeof e?r.success=e:(r.data=e,r.success=n),this.ajax(r)}},n=function(t){return new r(t||{})};n.cookie=e.cookie,n.ajax=e.ajax,n.get=e.get,n.match=e.match;var r=function(t){var n=this;if(n.length=0,"string"==typeof t){t.replace(/\n/g,"");var i=e.str2dom(t,!0);i.length>0?r.call(n,i):(i=e.qsa(t),r.call(n,i))}if(t)if(t[0]&&e.isElemType(t[0],[1,3,9,11])){for(var o=0,a=0,s=t.length;o<s;o++)e.isElem(t[o])&&(n[a]=t[o],a++);n.length=a}else(e.isElem(t)||window===t)&&(this[0]=t,this.length=1)};r.fn=r.prototype={each:function(t){for(var e=this,n=0,r=e.length;n<r;n++)t.call(e[n],n,e[n]);return e},children:function(t){var n=[];return this.each(function(r,i){for(var o in i.childNodes){var a=i.childNodes[o];t&&!e.match(a,t)||n.push(a)}}),new r(n)},on:function(t,e,n){return this.each(function(r,i){i[(n?"remove":"add")+"EventListener"](t,e)})},off:function(t,e){return this.on(t,e,!0)},click:function(t){return this.on("click",t)},trigger:function(e,n){var r=t.createEvent("Events");if(r.initEvent(e,!0,!0),n)for(var i in n)r[i]=n[i];return this.each(function(t,e){e.dispatchEvent(r)})},delegate:function(t,n,r){return this.on(n,function(n){var i=n._hack_target||n.target,o=e.match(i,t);o||(o=e.ancestor(i,t)),o&&r.call(o,n)})},show:function(t){return this.each(function(e,n){n.style.display=t||"block"})},hide:function(){return this.each(function(t,e){e.style.display="none"})},focus:function(){var t=this[0];return t&&t.focus&&t.focus(),this},last:function(){return new r(this[this.length-1])},val:function(t){var e=this[0];return void 0!==t&&e?(e.value=t,this):e&&e.value},offset:function(){var e=this[0],n=0,r=0;if(e)do n+=e.offsetLeft||0,r+=e.offsetTop||0;while((e=e.offsetParent)!=t.body&&e);return{left:n,top:r,width:this.width(),height:this.height()}},hasAttr:function(t){return this[0]&&this[0].hasAttribute(t)},attr:function(t,e){var n=this;return"undefined"!=typeof e?n.each(function(n,r){r.setAttribute(t,e)}):n[0]&&n[0].getAttribute(t)},removeAttr:function(t){return this.each(function(e,n){n.removeAttribute(t)})},_operateClass:function(t,e){t=t.split(",");var n=!0;return this.each(function(r,i){for(var r in t)if(!1===function(t,r){var o=i.className||"";if("r"==e){var a=new RegExp("\\s*\\b"+r+"\\b\\s*");i.className=o.replace(a," ").replace(/(^\s*)|(\s*$)/g,"")}else{if("t"==e&&!new RegExp("\\b"+r+"\\b").test(o))return n=!1,!1;new RegExp("\\b"+r+"\\b").test(o)||(i.className+=(o.length<1?"":" ")+r)}}(r,t[r]))break}),n},addClass:function(t){return this._operateClass(t),this},removeClass:function(t){return this._operateClass(t,"r"),this},hasClass:function(t){return this._operateClass(t,"t")},css:function(n,r){if(n=e.camelize(n),void 0!=r)return"number"==typeof r&&(r+="px"),this.each(function(t,e){e.style[n]=r});try{var i=t.defaultView.getComputedStyle(this[0])[n]}catch(t){}return i},cssNoUnit:function(t){var e=this.css(t);return"string"==typeof e?parseInt(e.replace(/(\d+)\w*/,"$1")):e},append:function(t){var e=this[0];if(!e)return this;var n=new r(t);return n.each(function(t,n){e.appendChild(n)}),this},prepend:function(t){var e=this[0];if(!e)return this;var n=new r(t),i=e.firstChild;return n.each(function(t,n){e.insertBefore(n,i)}),this},after:function(t){var e=this[0];if(!e)return this;var n=new r(t);return n.each(function(t,n){var r=e.parentNode;r.lastchild==e?r.appendChild(n):r.insertBefore(n,e.nextSibling)}),this},remove:function(){this.each(function(t,e){var n=e.parentNode;n&&n.removeChild(e)})},index:function(){var t=this[0],n=t&&t.parentNode;if(n){var r=n.childNodes,i=0;for(var o in r){if(t===r[o])break;e.isElem(r[o])&&i++}return i}return null}},[["next","next"],["prev","previous"]].forEach(function(t){var n=t[0],i=t[1]+"ElementSibling";r.fn[n]=function(t){var n=this,o=n[0];if(!o)return new r;if(t||(t=1),"number"==typeof t)for(;t--&&(o=o[i]););else for(;(o=o[i])&&!e.match(o,t););return new r(o)}}),[["find",function(t,n){return e.qsa(t,n)}],["parent",function(t,n){if(n){if("number"==typeof n){for(var r=t;r&&n--;)r=r.parentNode;return r}return e.ancestor(t,n)}return t.parentNode}]].forEach(function(t){var e=t[0],n=t[1];r.fn[e]=function(t){var e=[];return this.each(function(i,o){var a=n(o,t);new r(a).each(function(t,n){e.push(n)})}),new r(e)}}),[["text","Text"],["html","HTML"]].forEach(function(t){r.fn[t[0]]=function(e){var n=this[0],r="inner"+t[1];return"number"==typeof e&&(e=e.toString()),"string"==typeof e&&n?(this.each(function(){this[r]=e}),this):n&&n["inner"+t[1]]||null}});var i={innerWidth:["width",{"border-left-width":1,"border-right-width":1}],innerHeight:["height",{"border-top-width":1,"border-bottom-width":1}],width:["width",{"border-left-width":1,"border-right-width":1,"padding-left":1,"padding-right":1}],height:["height",{"border-top-width":1,"border-bottom-width":1,"padding-top":1,"padding-bottom":1}],outerWidth:["width"],outerHeight:["height"],left:["left"],top:["top"],paddingTop:["padding-top",null,1],paddingBottom:["padding-bottom",null,1],paddingLeft:["padding-left",null,1],paddingRight:["padding-right",null,1]};for(var o in i)!function(t,n){r.fn[n]=function(r){if(e.isStrNum(r))return this.css(n,r);var i=this[0],o=t[0],a=t[1],s=t[2];if(!i)return null;var u=this,c=0;for(var f in a){var h=a[f];c+=h*(u.cssNoUnit(f)||0)}if(s)var l=this.cssNoUnit(o);else l=i["offset"+e.camelize("-"+o)]-c;return l}}(i[o],o);window.$=window.$||n}();
;(function(global) {
  class GlobalKeyEventListener {
    constructor () {
      const self = this;
      this.handlers = {};

      document.addEventListener('keydown', (e) => {
//        console.log(e);
        const code = e.keyCode;
        const handlers = this.handlers[code];

        if (handlers && handlers.length > 0) {
          handlers.forEach((handler) => {
            handler.call(self, e);
          });
        }
      });
    }

    registerHandler (keyCode, handlerFn) {
      this.handlers[keyCode] = this.handlers[keyCode] || [];

      this.handlers[keyCode].push(handlerFn);
    }
  }
  GlobalKeyEventListener.KEY_LEFT = 37;
  GlobalKeyEventListener.KEY_UP = 38;
  GlobalKeyEventListener.KEY_RIGHT = 39;
  GlobalKeyEventListener.KEY_DOWN = 40;
  GlobalKeyEventListener.KEY_BACKSPACE = 8;

  const keyListener = new GlobalKeyEventListener();

  class SSZQ {
    constructor(target) {
      this.$dom = $(target);

      this.init();
    }

    init () {
      let $root = this.$dom.children('.root');
      if ($root.length < 1) {
        this.$dom.append('<span class="root"></span>');
        $root = this.$dom.children('.root');
      }

      this.$root = $root;

      $root.on('click', (e) => {
        this.focus(e.target);
      });
    }

    editable () {
      const cursor = new Cursor();

      this.$root.append(cursor.get$DOM());

      this.cursor = cursor;

      keyListener.registerHandler(GlobalKeyEventListener.KEY_LEFT, (e) => {
        this.cursor.move(-1);
      });
      keyListener.registerHandler(GlobalKeyEventListener.KEY_RIGHT, (e) => {
        this.cursor.move(1);
      });
      keyListener.registerHandler(GlobalKeyEventListener.KEY_UP, (e) => {
        this.cursor.moveUpDown(-1);
      });
      keyListener.registerHandler(GlobalKeyEventListener.KEY_DOWN, (e) => {
        this.cursor.moveUpDown(1);
      });
      keyListener.registerHandler(GlobalKeyEventListener.KEY_BACKSPACE, (e) => {
        this.cursor.delete();
      });
      const letterHandler = (e) => {
        this.cursor.input(e.key);
      };
      for (let i = 65; i < 65 + 26; i ++) {
        keyListener.registerHandler(i, letterHandler);
      }
    }

    focus (DOM) {
      if (this.cursor) {
        this.cursor.activate();
        this.cursor.moveTo(DOM ? $(DOM) : undefined);
        this.cursor.move(-1);
      }
    }
  }

  class Cursor {
    constructor () {
      this.$dom = $('<span class="cursor"></span>');
    }

    activate (duration) {
      this.inactivate();

      this.blink = true;

      this.tmr = setInterval(() => {
        this.syncCursorBlinkStatus();
        this.blink = !this.blink;
      }, duration || 450);
    }

    inactivate () {
      if (this.tmr) {
        clearInterval(this.tmr);
      }
      this.blink = false;
      this.syncCursorBlinkStatus();
    }

    syncCursorBlinkStatus () {
      this.$dom[(this.blink ? 'add' : 'remove') + 'Class']('blink');
    }

    get$DOM () {
      return this.$dom;
    }

    input (command) {
      let matched = false;
      const $dom = this.$dom;

      if (command.match(/[A-z]/)) {
        matched = true;
        const $domToAdd =$('<var sel_word>' + command + '</var>')
        const $tprev = $dom.prev();
        if ($tprev.length > 0) {
          $tprev.after($domToAdd);
        }
        else {
          $dom.parent().prepend($domToAdd);
        }
      }

      if (matched) {
        $dom.parent().children('[sel_word].empty-word').remove();
      }
    }

    delete () {
      const $dom = this.$dom;
      const $prev = $dom.prev();
      if ($prev.length > 0) {
        $prev.remove();
      }
      else {
        const $parentLeaf = $dom.parent('[sel_leaf]');
        $parentLeaf.remove();
      }
    }

    moveTo ($dom) {
      $dom.append(this.$dom);
    }
    moveUpDown (offset) {
      const $dom = this.$dom;
      const upOrDown = offset < 0;
      const index = $dom.index();
      const relative$dom = $dom.parent()[upOrDown ? 'prev' : 'next']();

//      console.log(relative$dom);
      const $children = relative$dom.children();
      const overRange = index < $children.length;
      this.move(overRange ? 1 : -1, $($children[overRange ? index : $children.length - 1]));
    }
    move (offset, specifiedTarget$dom) {
      const $dom = this.$dom;
      const prevOrNext = offset < 0;
      const target$dom = specifiedTarget$dom || this._findPrevOrNextWord$DOM($dom, prevOrNext);

      if (target$dom.hasAttr('sel_root')) {
        target$dom[prevOrNext? 'prepend' : 'append']($dom);
        return;
      }

      const isSibling = target$dom[0] === $dom[prevOrNext? 'prev': 'next']()[0];

      const insertBeforeOrAfter = isSibling ? prevOrNext : !prevOrNext;

        if (insertBeforeOrAfter) {
          const $tprev = target$dom.prev();
          if ($tprev.length > 0) {
            $tprev.after($dom);
          }
          else {
            target$dom.parent().prepend($dom);
          }
        }
        else {
          target$dom.after($dom);
        }

    }

    _findPrevOrNextWord$DOM ($dom, prevOrNext) {
      let current$dom = $dom;
      for (let i = 0; i < 100; i++) {
//        console.log(current$dom);
        const child$dom = current$dom.children();
        if (child$dom.length > 0) {
          current$dom = $(child$dom[prevOrNext ? child$dom.length - 1 : 0]);
        }
        else if (current$dom.hasAttr('sel_word')) {
          return current$dom;
        }
        else {
          let sibling$dom;
          while(!current$dom.hasAttr('sel_root') && (sibling$dom = current$dom[prevOrNext ? 'prev': 'next']()).length  < 1) {
            current$dom = current$dom.parent();
          }

          if (sibling$dom && sibling$dom.length > 0) {
            current$dom = sibling$dom;
            continue;
          }
          else {
//            console.log(current$dom);
            return current$dom;
          }
        }
      }
    }
  }

  global.SSZQ = SSZQ;
})(window);