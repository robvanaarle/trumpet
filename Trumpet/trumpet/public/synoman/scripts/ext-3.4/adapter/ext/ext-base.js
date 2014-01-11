/* Copyright (c) 2012 Synology Inc. All rights reserved. */

/*
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
window.undefined=window.undefined;Ext={version:"3.4.0",versionDetail:{major:3,minor:4,patch:0}};Ext.apply=function(d,e,b){if(b){Ext.apply(d,b)}if(d&&e&&typeof e=="object"){for(var a in e){d[a]=e[a]}}return d};(function(){var g=0,w=Object.prototype.toString,x=navigator.userAgent.toLowerCase(),C=function(e){return e.test(x)},i=document,p=i.documentMode,m=i.compatMode=="CSS1Compat",E=C(/opera/),h=C(/\bchrome\b/),y=C(/webkit/),B=!h&&C(/safari/),f=B&&C(/applewebkit\/4/),b=B&&C(/version\/3/),F=B&&C(/version\/4/),v=!E&&C(/msie/),n=v&&(C(/msie 10/)),r=v&&(C(/trident\/5/)||C(/trident\/6/)),s=v&&!r&&!n&&C(/trident/),t=v&&!s&&!r&&!n&&C(/msie 7/),u=v&&!t&&!s&&!r&&!n&&C(/msie 6/),k=v&&!t&&!s&&(r||n),q=!y&&C(/gecko/),d=q&&C(/rv:1\.8/),a=q&&C(/rv:1\.9/),z=v&&!m,D=C(/windows|win32/),l=C(/macintosh|mac os x/),j=C(/adobeair/),o=C(/linux/),c=/^https/i.test(window.location.protocol);if(u){try{i.execCommand("BackgroundImageCache",false,true)}catch(A){}}Ext.apply(Ext,{SSL_SECURE_URL:c&&v?'javascript:""':"about:blank",isStrict:m,isSecure:c,isReady:false,enableForcedBoxModel:false,enableGarbageCollector:true,enableListenerCollection:false,enableNestedListenerRemoval:false,USE_NATIVE_JSON:false,applyIf:function(G,H){if(G){for(var e in H){if(!Ext.isDefined(G[e])){G[e]=H[e]}}}return G},id:function(e,G){e=Ext.getDom(e,true)||{};if(!e.id){e.id=(G||"ext-gen")+(++g)}return e.id},extend:function(){var G=function(I){for(var H in I){this[H]=I[H]}};var e=Object.prototype.constructor;return function(M,J,L){if(typeof J=="object"){L=J;J=M;M=L.constructor!=e?L.constructor:function(){J.apply(this,arguments)}}var I=function(){},K,H=J.prototype;I.prototype=H;K=M.prototype=new I();K.constructor=M;M.superclass=H;if(H.constructor==e){H.constructor=J}M.override=function(N){Ext.override(M,N)};K.superclass=K.supr=(function(){return H});K.override=G;Ext.override(M,L);M.extend=function(N){return Ext.extend(M,N)};return M}}(),override:function(e,H){if(H){var G=e.prototype;Ext.apply(G,H);if(Ext.isIE&&H.hasOwnProperty("toString")){G.toString=H.toString}}},namespace:function(){var I=arguments.length,J=0,G,H,e,L,K,M;for(;J<I;++J){e=arguments[J];L=arguments[J].split(".");M=window[L[0]];if(M===undefined){M=window[L[0]]={}}K=L.slice(1);G=K.length;for(H=0;H<G;++H){M=M[K[H]]=M[K[H]]||{}}}return M},urlEncode:function(K,J){var H,G=[],I=encodeURIComponent;Ext.iterate(K,function(e,L){H=Ext.isEmpty(L);Ext.each(H?e:L,function(M){G.push("&",I(e),"=",(!Ext.isEmpty(M)&&(M!=e||!H))?(Ext.isDate(M)?Ext.encode(M).replace(/"/g,""):I(M)):"")})});if(!J){G.shift();J=""}return J+G.join("")},urlDecode:function(H,G){if(Ext.isEmpty(H)){return{}}var K={},J=H.split("&"),L=decodeURIComponent,e,I;Ext.each(J,function(M){M=M.split("=");e=L(M[0]);I=L(M[1]);K[e]=G||!K[e]?I:[].concat(K[e]).concat(I)});return K},urlAppend:function(e,G){if(!Ext.isEmpty(G)){return e+(e.indexOf("?")===-1?"?":"&")+G}return e},toArray:function(){return v?function(H,K,I,J){J=[];for(var G=0,e=H.length;G<e;G++){J.push(H[G])}return J.slice(K||0,I||J.length)}:function(e,H,G){return Array.prototype.slice.call(e,H||0,G||e.length)}}(),isIterable:function(e){if(Ext.isArray(e)||e.callee){return true}if(/NodeList|HTMLCollection/.test(w.call(e))){return true}return((typeof e.nextNode!="undefined"||e.item)&&Ext.isNumber(e.length))},each:function(J,I,H){if(Ext.isEmpty(J,true)){return}if(!Ext.isIterable(J)||Ext.isPrimitive(J)){J=[J]}for(var G=0,e=J.length;G<e;G++){if(I.call(H||J[G],J[G],G,J)===false){return G}}},iterate:function(H,G,e){if(Ext.isEmpty(H)){return}if(Ext.isIterable(H)){Ext.each(H,G,e);return}else{if(typeof H=="object"){for(var I in H){if(H.hasOwnProperty(I)){if(G.call(e||H,I,H[I],H)===false){return}}}}}},getDom:function(H,G){if(!H||!i){return null}if(H.dom){return H.dom}else{if(typeof H=="string"){var I=i.getElementById(H);if(I&&v&&G){if(H==I.getAttribute("id")){return I}else{return null}}return I}else{return H}}},getBody:function(){return Ext.get(i.body||i.documentElement)},getHead:function(){var e;return function(){if(e==undefined){e=Ext.get(i.getElementsByTagName("head")[0])}return e}}(),removeNode:v&&!s?function(){var e;return function(G){if(G&&G.tagName!="BODY"){(Ext.enableNestedListenerRemoval)?Ext.EventManager.purgeElement(G,true):Ext.EventManager.removeAll(G);e=e||i.createElement("div");e.appendChild(G);e.innerHTML="";delete Ext.elCache[G.id]}}}():function(e){if(e&&e.parentNode&&e.tagName!="BODY"){(Ext.enableNestedListenerRemoval)?Ext.EventManager.purgeElement(e,true):Ext.EventManager.removeAll(e);e.parentNode.removeChild(e);delete Ext.elCache[e.id]}},isEmpty:function(G,e){return G===null||G===undefined||((Ext.isArray(G)&&!G.length))||(!e?G==="":false)},isArray:function(e){return w.apply(e)==="[object Array]"},isDate:function(e){return w.apply(e)==="[object Date]"},isObject:function(e){return !!e&&Object.prototype.toString.call(e)==="[object Object]"},isPrimitive:function(e){return Ext.isString(e)||Ext.isNumber(e)||Ext.isBoolean(e)},isFunction:function(e){return w.apply(e)==="[object Function]"},isNumber:function(e){return typeof e==="number"&&isFinite(e)},isString:function(e){return typeof e==="string"},isBoolean:function(e){return typeof e==="boolean"},isElement:function(e){return e?!!e.tagName:false},isDefined:function(e){return typeof e!=="undefined"},isOpera:E,isWebKit:y,isChrome:h,isSafari:B,isSafari3:b,isSafari4:F,isSafari2:f,isIE:v,isIE6:u,isIE7:t,isIE8:s,isIE9:r,isIE10:n,isModernIE:k,isGecko:q,isGecko2:d,isGecko3:a,isBorderBox:z,isLinux:o,isWindows:D,isMac:l,isAir:j});Ext.ns=Ext.namespace})();(function(){if(!Ext.isIE){return}var b=0,a={};window.setInterval=function(c,e){var f=++b,d=function(){try{c()}catch(g){if(!Ext.isIE8){throw g}}if(a[f]){a[f]=setTimeout(arguments.callee,e)}};a[f]=setTimeout(d,e);return f};window.clearInterval=function(d){try{if(!a[d]){return}clearTimeout(a[d]);delete a[d]}catch(c){if(!Ext.isIE8){throw c}}}})();Ext.ns("Ext.util","Ext.lib","Ext.data","Ext.supports");Ext.elCache={};Ext.apply(Function.prototype,{createInterceptor:function(b,a){var c=this;return !Ext.isFunction(b)?this:function(){var e=this,d=arguments;b.target=e;b.method=c;return(b.apply(a||e||window,d)!==false)?c.apply(e||window,d):null}},createCallback:function(){var a=arguments,b=this;return function(){return b.apply(window,a)}},createDelegate:function(c,b,a){var d=this;return function(){var f=b||arguments;if(a===true){f=Array.prototype.slice.call(arguments,0);f=f.concat(b)}else{if(Ext.isNumber(a)){f=Array.prototype.slice.call(arguments,0);var e=[a,0].concat(b);Array.prototype.splice.apply(f,e)}}return d.apply(c||window,f)}},defer:function(c,e,b,a){var d=this.createDelegate(e,b,a);if(c>0){return setTimeout(d,c)}d();return 0}});Ext.applyIf(String,{format:function(b){var a=Ext.toArray(arguments,1);return b.replace(/\{(\d+)\}/g,function(c,d){return a[d]})}});Ext.applyIf(Array.prototype,{indexOf:function(b,c){var a=this.length;c=c||0;c+=(c<0)?a:0;for(;c<a;++c){if(this[c]===b){return c}}return -1},remove:function(b){var a=this.indexOf(b);if(a!=-1){this.splice(a,1)}return this}});Ext.util.TaskRunner=function(e){e=e||10;var f=[],a=[],b=0,g=false,d=function(){g=false;clearInterval(b);b=0},h=function(){if(!g){g=true;b=setInterval(i,e)}},c=function(j){a.push(j);if(j.onStop){j.onStop.apply(j.scope||j)}},i=function(){var l=a.length,n=new Date().getTime();if(l>0){for(var p=0;p<l;p++){f.remove(a[p])}a=[];if(f.length<1){d();return}}for(var p=0,o,k,m,j=f.length;p<j;++p){o=f[p];k=n-o.taskRunTime;if(o.interval<=k){m=o.run.apply(o.scope||o,o.args||[++o.taskRunCount]);o.taskRunTime=n;if(m===false||o.taskRunCount===o.repeat){c(o);return}}if(o.duration&&o.duration<=(n-o.taskStartTime)){c(o)}}};this.start=function(j){f.push(j);j.taskStartTime=new Date().getTime();j.taskRunTime=0;j.taskRunCount=0;h();return j};this.stop=function(j){c(j);return j};this.stopAll=function(){d();for(var k=0,j=f.length;k<j;k++){if(f[k].onStop){f[k].onStop()}}f=[];a=[]}};Ext.TaskMgr=new Ext.util.TaskRunner();(function(){var b;function c(d){if(!b){b=new Ext.Element.Flyweight()}b.dom=d;return b}(function(){var g=document,e=g.compatMode=="CSS1Compat",f=Math.max,d=Math.round,h=parseInt;Ext.lib.Dom={isAncestor:function(j,k){var i=false;j=Ext.getDom(j);k=Ext.getDom(k);if(j&&k){if(j.contains){return j.contains(k)}else{if(j.compareDocumentPosition){return !!(j.compareDocumentPosition(k)&16)}else{while(k=k.parentNode){i=k==j||i}}}}return i},getViewWidth:function(i){return i?this.getDocumentWidth():this.getViewportWidth()},getViewHeight:function(i){return i?this.getDocumentHeight():this.getViewportHeight()},getDocumentHeight:function(){return f(!e?g.body.scrollHeight:g.documentElement.scrollHeight,this.getViewportHeight())},getDocumentWidth:function(){return f(!e?g.body.scrollWidth:g.documentElement.scrollWidth,this.getViewportWidth())},getViewportHeight:function(){return Ext.isIE?(Ext.isStrict?g.documentElement.clientHeight:g.body.clientHeight):self.innerHeight},getViewportWidth:function(){return !Ext.isStrict&&!Ext.isOpera?g.body.clientWidth:Ext.isIE?g.documentElement.clientWidth:self.innerWidth},getY:function(i){return this.getXY(i)[1]},getX:function(i){return this.getXY(i)[0]},getXY:function(k){var j,q,s,v,l,m,u=0,r=0,t,i,n=(g.body||g.documentElement),o=[0,0];k=Ext.getDom(k);if(k!=n){if(k.getBoundingClientRect){s=k.getBoundingClientRect();t=c(document).getScroll();o=[d(s.left+t.left),d(s.top+t.top)]}else{j=k;i=c(k).isStyle("position","absolute");while(j){q=c(j);u+=j.offsetLeft;r+=j.offsetTop;i=i||q.isStyle("position","absolute");if(Ext.isGecko){r+=v=h(q.getStyle("borderTopWidth"),10)||0;u+=l=h(q.getStyle("borderLeftWidth"),10)||0;if(j!=k&&!q.isStyle("overflow","visible")){u+=l;r+=v}}j=j.offsetParent}if(Ext.isSafari&&i){u-=n.offsetLeft;r-=n.offsetTop}if(Ext.isGecko&&!i){m=c(n);u+=h(m.getStyle("borderLeftWidth"),10)||0;r+=h(m.getStyle("borderTopWidth"),10)||0}j=k.parentNode;while(j&&j!=n){if(!Ext.isOpera||(j.tagName!="TR"&&!c(j).isStyle("display","inline"))){u-=j.scrollLeft;r-=j.scrollTop}j=j.parentNode}o=[u,r]}}return o},setXY:function(j,k){(j=Ext.fly(j,"_setXY")).position();var l=j.translatePoints(k),i=j.dom.style,m;for(m in l){if(!isNaN(l[m])){i[m]=l[m]+"px"}}},setX:function(j,i){this.setXY(j,[i,false])},setY:function(i,j){this.setXY(i,[false,j])}}})();Ext.lib.Event=function(){var v=false,f={},z=0,o=[],d,A=false,k=window,E=document,l=200,r=20,p=0,i=1,s=2,w=3,t="scrollLeft",q="scrollTop",g="unload",y="mouseover",D="mouseout",e=function(){var F;if(k.addEventListener){F=function(J,H,I,G){if(H=="mouseenter"){I=I.createInterceptor(n);J.addEventListener(y,I,(G))}else{if(H=="mouseleave"){I=I.createInterceptor(n);J.addEventListener(D,I,(G))}else{J.addEventListener(H,I,(G))}}return I}}else{if(k.attachEvent){F=function(J,H,I,G){J.attachEvent("on"+H,I);return I}}else{F=function(){}}}return F}(),h=function(){var F;if(k.removeEventListener){F=function(J,H,I,G){if(H=="mouseenter"){H=y}else{if(H=="mouseleave"){H=D}}J.removeEventListener(H,I,(G))}}else{if(k.detachEvent){F=function(I,G,H){I.detachEvent("on"+G,H)}}else{F=function(){}}}return F}();function n(F){return !u(F.currentTarget,x.getRelatedTarget(F))}function u(F,G){if(F&&F.firstChild){while(G){if(G===F){return true}G=G.parentNode;if(G&&(G.nodeType!=1)){G=null}}}return false}function B(){var G=false,L=[],J,I,F,H,K=!v||(z>0);if(!A){A=true;for(I=0;I<o.length;++I){F=o[I];if(F&&(J=E.getElementById(F.id))){if(!F.checkReady||v||J.nextSibling||(E&&E.body)){H=F.override;J=H?(H===true?F.obj:H):J;F.fn.call(J,F.obj);o.remove(F);--I}else{L.push(F)}}}z=(L.length===0)?0:z-1;if(K){m()}else{clearInterval(d);d=null}G=!(A=false)}return G}function m(){if(!d){var F=function(){B()};d=setInterval(F,r)}}function C(){var F=E.documentElement,G=E.body;if(F&&(F[q]||F[t])){return[F[t],F[q]]}else{if(G){return[G[t],G[q]]}else{return[0,0]}}}function j(F,G){F=F.browserEvent||F;var H=F["page"+G];if(!H&&H!==0){H=F["client"+G]||0;if(Ext.isIE){H+=C()[G=="X"?0:1]}}return H}var x={extAdapter:true,onAvailable:function(H,F,I,G){o.push({id:H,fn:F,obj:I,override:G,checkReady:false});z=l;m()},addListener:function(H,F,G){H=Ext.getDom(H);if(H&&G){if(F==g){if(f[H.id]===undefined){f[H.id]=[]}f[H.id].push([F,G]);return G}return e(H,F,G,false)}return false},removeListener:function(L,H,K){L=Ext.getDom(L);var J,G,F,I;if(L&&K){if(H==g){if((I=f[L.id])!==undefined){for(J=0,G=I.length;J<G;J++){if((F=I[J])&&F[p]==H&&F[i]==K){f[L.id].splice(J,1)}}}return}h(L,H,K,false)}},getTarget:function(F){F=F.browserEvent||F;return this.resolveTextNode(F.target||F.srcElement)},resolveTextNode:Ext.isGecko?function(G){if(!G){return}var F=HTMLElement.prototype.toString.call(G);if(F=="[xpconnect wrapped native prototype]"||F=="[object XULElement]"){return}return G.nodeType==3?G.parentNode:G}:function(F){return F&&F.nodeType==3?F.parentNode:F},getRelatedTarget:function(F){F=F.browserEvent||F;return this.resolveTextNode(F.relatedTarget||(/(mouseout|mouseleave)/.test(F.type)?F.toElement:/(mouseover|mouseenter)/.test(F.type)?F.fromElement:null))},getPageX:function(F){return j(F,"X")},getPageY:function(F){return j(F,"Y")},getXY:function(F){return[this.getPageX(F),this.getPageY(F)]},stopEvent:function(F){this.stopPropagation(F);this.preventDefault(F)},stopPropagation:function(F){F=F.browserEvent||F;if(F.stopPropagation){F.stopPropagation()}else{F.cancelBubble=true}},preventDefault:function(F){F=F.browserEvent||F;if(F.preventDefault){F.preventDefault()}else{if(F.keyCode){F.keyCode=0}F.returnValue=false}},getEvent:function(F){F=F||k.event;if(!F){var G=this.getEvent.caller;while(G){F=G.arguments[0];if(F&&Event==F.constructor){break}G=G.caller}}return F},getCharCode:function(F){F=F.browserEvent||F;return F.charCode||F.keyCode||0},getListeners:function(G,F){Ext.EventManager.getListeners(G,F)},purgeElement:function(G,H,F){Ext.EventManager.purgeElement(G,H,F)},_load:function(F){v=true;if(Ext.isIE&&F!==true){h(k,"load",arguments.callee)}},_unload:function(J){var G=Ext.lib.Event,H,M,K,F,I,N;for(F in f){K=f[F];for(H=0,I=K.length;H<I;H++){M=K[H];if(M){try{N=M[w]?(M[w]===true?M[s]:M[w]):k;M[i].call(N,G.getEvent(J),M[s])}catch(L){}}}}Ext.EventManager._unload();h(k,g,G._unload)}};x.on=x.addListener;x.un=x.removeListener;if(E&&E.body){x._load(true)}else{e(k,"load",x._load)}e(k,g,x._unload);B();return x}();Ext.lib.Ajax=function(){var g=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP"],d="Content-Type";function h(w){var u=w.conn,x,v={};function t(y,z){for(x in z){if(z.hasOwnProperty(x)){y.setRequestHeader(x,z[x])}}}Ext.apply(v,k.headers,k.defaultHeaders);t(u,v);delete k.headers}function e(w,v,u,t){return{tId:w,status:u?-1:0,statusText:u?"transaction aborted":"communication failure",isAbort:u,isTimeout:t,argument:v}}function j(t,u){(k.headers=k.headers||{})[t]=u}function q(u,y){var C={},x,w=u.conn,A,B,v=w.status==1223;try{x=u.conn.getAllResponseHeaders();Ext.each(x.replace(/\r\n/g,"\n").split("\n"),function(t){A=t.indexOf(":");if(A>=0){B=t.substr(0,A).toLowerCase();if(t.charAt(A+1)==" "){++A}C[B]=t.substr(A+1)}})}catch(z){}return{tId:u.tId,status:v?204:w.status,statusText:v?"No Content":w.statusText,getResponseHeader:function(t){return C[t.toLowerCase()]},getAllResponseHeaders:function(){return x},responseText:w.responseText,responseXML:w.responseXML,argument:y}}function p(t){if(t.tId){k.conn[t.tId]=null}t.conn=null;t=null}function f(y,z,u,t){if(!z){p(y);return}var w,v;try{if(y.conn.status!==undefined&&y.conn.status!=0){w=y.conn.status}else{w=13030}}catch(x){w=13030}if((w>=200&&w<300)||(Ext.isIE&&w==1223)){v=q(y,z.argument);if(z.success){if(!z.scope){z.success(v)}else{z.success.apply(z.scope,[v])}}}else{switch(w){case 12002:case 12029:case 12030:case 12031:case 12152:case 13030:v=e(y.tId,z.argument,(u?u:false),t);if(z.failure){if(!z.scope){z.failure(v)}else{z.failure.apply(z.scope,[v])}}break;default:v=q(y,z.argument);if(z.failure){if(!z.scope){z.failure(v)}else{z.failure.apply(z.scope,[v])}}}}p(y);v=null}function n(v,y,t,x,u,w){if(t&&t.readyState==4){clearInterval(u[x]);u[x]=null;if(w){clearTimeout(k.timeout[x]);k.timeout[x]=null}f(v,y)}}function s(t,u){k.abort(t,u,true)}function o(w,z,u){z=z||{};var t=w.conn,y=w.tId,v=k.poll,x=z.timeout||null;if(x){k.conn[y]=t;k.timeout[y]=setTimeout(s.createCallback(w,z),x)}v[y]=setInterval(n.createCallback(w,z,t,y,v,x),k.pollInterval);if(u&&u.html5upload&&u.progress&&w.conn.upload){if(!z.scope){w.conn.upload.onprogress=u.progress.createDelegate(this,[],true)}else{w.conn.upload.onprogress=u.progress.createDelegate(z.scope,[],true)}}}function m(y,v,x,t,u){var w=l()||null;if(w){w.conn.open(y,v,true);if(k.defaultHeaders||k.headers){h(w)}o(w,x,u);if(!u.html5upload||(u.html5upload&&!u.chunkmode)||!Ext.isFunction(w.conn.sendAsBinary)){w.conn.send(t||null)}else{w.conn.sendAsBinary(t||null)}}return w}function i(x,u,w,t){var v=l()||null;if(v){v.conn.open(x,u,true);if(k.useDefaultXhrHeader){j("X-Requested-With",k.defaultXhrHeader)}if(t&&k.useDefaultHeader&&(!k.headers||!k.headers[d])){j(d,k.defaultPostHeader)}if(k.defaultHeaders||k.headers){h(v)}o(v,w);v.conn.send(t||null)}return v}function l(){var u;try{if(u=r(k.transactionId)){k.transactionId++}}catch(t){}finally{return u}}function r(w){var t;try{t=new XMLHttpRequest()}catch(v){for(var u=Ext.isIE6?1:0;u<g.length;++u){try{t=new ActiveXObject(g[u]);break}catch(v){}}}finally{return{conn:t,tId:w}}}var k={request:function(t,v,w,x,B){if(B){var y=this,u=B.xmlData,z=B.jsonData,A;Ext.applyIf(y,B);if(u||z){A=y.headers;if(!A||!A[d]){j(d,u?"text/xml":"application/json")}x=u||(!Ext.isPrimitive(z)?Ext.encode(z):z)}}return i(t||B.method||"POST",v,w,x)},html5upload:function(z,w,t,x,u){if(u){var v=this,y=u.uploadData;Ext.applyIf(v,u);if(y){x=y}}return m(z||u.method||"POST",w,t,x,u)},serializeForm:function(z){var y=z.elements||(document.forms[z]||Ext.getDom(z)).elements,t=false,x=encodeURIComponent,u,A="",w,v;Ext.each(y,function(B){u=B.name;w=B.type;if(!B.disabled&&u){if(/select-(one|multiple)/i.test(w)){Ext.each(B.options,function(C){if(C.selected){v=C.hasAttribute?C.hasAttribute("value"):C.getAttributeNode("value").specified;A+=String.format("{0}={1}&",x(u),x(v?C.value:C.text))}})}else{if(!(/file|undefined|reset|button/i.test(w))){if(!(/radio|checkbox/i.test(w)&&!B.checked)&&!(w=="submit"&&t)){A+=x(u)+"="+x(B.value)+"&";t=/submit/i.test(w)}}}}});return A.substr(0,A.length-1)},useDefaultHeader:true,defaultPostHeader:"application/x-www-form-urlencoded; charset=UTF-8",useDefaultXhrHeader:true,defaultXhrHeader:"XMLHttpRequest",poll:{},timeout:{},conn:{},pollInterval:50,transactionId:0,abort:function(w,y,t){var v=this,x=w.tId,u=false;if(v.isCallInProgress(w)){w.conn.abort();clearInterval(v.poll[x]);v.poll[x]=null;clearTimeout(k.timeout[x]);v.timeout[x]=null;f(w,y,(u=true),t)}return u},isCallInProgress:function(t){return t.conn&&!{0:true,4:true}[t.conn.readyState]}};return k}();(function(){var g=Ext.lib,i=/width|height|opacity|padding/i,f=/^((width|height)|(top|left))$/,d=/width|height|top$|bottom$|left$|right$/i,h=/\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i,j=function(k){return typeof k!=="undefined"},e=function(){return new Date()};g.Anim={motion:function(n,l,o,p,k,m){return this.run(n,l,o,p,k,m,Ext.lib.Motion)},run:function(o,l,q,r,k,n,m){m=m||Ext.lib.AnimBase;if(typeof r=="string"){r=Ext.lib.Easing[r]}var p=new m(o,l,q,r);p.animateX(function(){if(Ext.isFunction(k)){k.call(n)}});return p}};g.AnimBase=function(l,k,m,n){if(l){this.init(l,k,m,n)}};g.AnimBase.prototype={doMethod:function(k,n,l){var m=this;return m.method(m.curFrame,n,l-n,m.totalFrames)},setAttr:function(k,m,l){if(i.test(k)&&m<0){m=0}Ext.fly(this.el,"_anim").setStyle(k,m+l)},getAttr:function(k){var m=Ext.fly(this.el),n=m.getStyle(k),l=f.exec(k)||[];if(n!=="auto"&&!h.test(n)){return parseFloat(n)}return(!!(l[2])||(m.getStyle("position")=="absolute"&&!!(l[3])))?m.dom["offset"+l[0].charAt(0).toUpperCase()+l[0].substr(1)]:0},getDefaultUnit:function(k){return d.test(k)?"px":""},animateX:function(n,k){var l=this,m=function(){l.onComplete.removeListener(m);if(Ext.isFunction(n)){n.call(k||l,l)}};l.onComplete.addListener(m,l);l.animate()},setRunAttr:function(p){var r=this,s=this.attributes[p],t=s.to,q=s.by,u=s.from,v=s.unit,l=(this.runAttrs[p]={}),m;if(!j(t)&&!j(q)){return false}var k=j(u)?u:r.getAttr(p);if(j(t)){m=t}else{if(j(q)){if(Ext.isArray(k)){m=[];for(var n=0,o=k.length;n<o;n++){m[n]=k[n]+q[n]}}else{m=k+q}}}Ext.apply(l,{start:k,end:m,unit:j(v)?v:r.getDefaultUnit(p)})},init:function(l,p,o,k){var r=this,n=0,s=g.AnimMgr;Ext.apply(r,{isAnimated:false,startTime:null,el:Ext.getDom(l),attributes:p||{},duration:o||1,method:k||g.Easing.easeNone,useSec:true,curFrame:0,totalFrames:s.fps,runAttrs:{},animate:function(){var u=this,v=u.duration;if(u.isAnimated){return false}u.curFrame=0;u.totalFrames=u.useSec?Math.ceil(s.fps*v):v;s.registerElement(u)},stop:function(u){var v=this;if(u){v.curFrame=v.totalFrames;v._onTween.fire()}s.stop(v)}});var t=function(){var v=this,u;v.onStart.fire();v.runAttrs={};for(u in this.attributes){this.setRunAttr(u)}v.isAnimated=true;v.startTime=e();n=0};var q=function(){var v=this;v.onTween.fire({duration:e()-v.startTime,curFrame:v.curFrame});var w=v.runAttrs;for(var u in w){this.setAttr(u,v.doMethod(u,w[u].start,w[u].end),w[u].unit)}++n};var m=function(){var u=this,w=(e()-u.startTime)/1000,v={duration:w,frames:n,fps:n/w};u.isAnimated=false;n=0;u.onComplete.fire(v)};r.onStart=new Ext.util.Event(r);r.onTween=new Ext.util.Event(r);r.onComplete=new Ext.util.Event(r);(r._onStart=new Ext.util.Event(r)).addListener(t);(r._onTween=new Ext.util.Event(r)).addListener(q);(r._onComplete=new Ext.util.Event(r)).addListener(m)}};Ext.lib.AnimMgr=new function(){var o=this,m=null,l=[],k=0;Ext.apply(o,{fps:1000,delay:1,registerElement:function(q){l.push(q);++k;q._onStart.fire();o.start()},unRegister:function(r,q){r._onComplete.fire();q=q||p(r);if(q!=-1){l.splice(q,1)}if(--k<=0){o.stop()}},start:function(){if(m===null){m=setInterval(o.run,o.delay)}},stop:function(s){if(!s){clearInterval(m);for(var r=0,q=l.length;r<q;++r){if(l[0].isAnimated){o.unRegister(l[0],0)}}l=[];m=null;k=0}else{o.unRegister(s)}},run:function(){var t,s,q,r;for(s=0,q=l.length;s<q;s++){r=l[s];if(r&&r.isAnimated){t=r.totalFrames;if(r.curFrame<t||t===null){++r.curFrame;if(r.useSec){n(r)}r._onTween.fire()}else{o.stop(r)}}}}});var p=function(s){var r,q;for(r=0,q=l.length;r<q;r++){if(l[r]===s){return r}}return -1};var n=function(r){var v=r.totalFrames,u=r.curFrame,t=r.duration,s=(u*t*1000/v),q=(e()-r.startTime),w=0;if(q<t*1000){w=Math.round((q/s-1)*u)}else{w=v-(u+1)}if(w>0&&isFinite(w)){if(r.curFrame+w>=v){w=v-(u+1)}r.curFrame+=w}}};g.Bezier=new function(){this.getPosition=function(p,o){var r=p.length,m=[],q=1-o,l,k;for(l=0;l<r;++l){m[l]=[p[l][0],p[l][1]]}for(k=1;k<r;++k){for(l=0;l<r-k;++l){m[l][0]=q*m[l][0]+o*m[parseInt(l+1,10)][0];m[l][1]=q*m[l][1]+o*m[parseInt(l+1,10)][1]}}return[m[0][0],m[0][1]]}};g.Easing={easeNone:function(l,k,n,m){return n*l/m+k},easeIn:function(l,k,n,m){return n*(l/=m)*l+k},easeOut:function(l,k,n,m){return -n*(l/=m)*(l-2)+k}};(function(){g.Motion=function(o,n,p,q){if(o){g.Motion.superclass.constructor.call(this,o,n,p,q)}};Ext.extend(g.Motion,Ext.lib.AnimBase);var m=g.Motion.superclass,l=/^points$/i;Ext.apply(g.Motion.prototype,{setAttr:function(n,r,q){var p=this,o=m.setAttr;if(l.test(n)){q=q||"px";o.call(p,"left",r[0],q);o.call(p,"top",r[1],q)}else{o.call(p,n,r,q)}},getAttr:function(n){var p=this,o=m.getAttr;return l.test(n)?[o.call(p,"left"),o.call(p,"top")]:o.call(p,n)},doMethod:function(n,q,o){var p=this;return l.test(n)?g.Bezier.getPosition(p.runAttrs[n],p.method(p.curFrame,0,100,p.totalFrames)/100):m.doMethod.call(p,n,q,o)},setRunAttr:function(u){if(l.test(u)){var w=this,p=this.el,z=this.attributes.points,s=z.control||[],x=z.from,y=z.to,v=z.by,A=g.Dom,o,r,q,t,n;if(s.length>0&&!Ext.isArray(s[0])){s=[s]}else{}Ext.fly(p,"_anim").position();A.setXY(p,j(x)?x:A.getXY(p));o=w.getAttr("points");if(j(y)){q=k.call(w,y,o);for(r=0,t=s.length;r<t;++r){s[r]=k.call(w,s[r],o)}}else{if(j(v)){q=[o[0]+v[0],o[1]+v[1]];for(r=0,t=s.length;r<t;++r){s[r]=[o[0]+s[r][0],o[1]+s[r][1]]}}}n=this.runAttrs[u]=[o];if(s.length>0){n=n.concat(s)}n[n.length]=q}else{m.setRunAttr.call(this,u)}}});var k=function(n,p){var o=g.Dom.getXY(this.el);return[n[0]-o[0]+p[0],n[1]-o[1]+p[1]]}})()})();(function(){var d=Math.abs,i=Math.PI,h=Math.asin,g=Math.pow,e=Math.sin,f=Ext.lib;Ext.apply(f.Easing,{easeBoth:function(k,j,m,l){return((k/=l/2)<1)?m/2*k*k+j:-m/2*((--k)*(k-2)-1)+j},easeInStrong:function(k,j,m,l){return m*(k/=l)*k*k*k+j},easeOutStrong:function(k,j,m,l){return -m*((k=k/l-1)*k*k*k-1)+j},easeBothStrong:function(k,j,m,l){return((k/=l/2)<1)?m/2*k*k*k*k+j:-m/2*((k-=2)*k*k*k-2)+j},elasticIn:function(l,j,q,o,k,n){if(l==0||(l/=o)==1){return l==0?j:j+q}n=n||(o*0.3);var m;if(k>=d(q)){m=n/(2*i)*h(q/k)}else{k=q;m=n/4}return -(k*g(2,10*(l-=1))*e((l*o-m)*(2*i)/n))+j},elasticOut:function(l,j,q,o,k,n){if(l==0||(l/=o)==1){return l==0?j:j+q}n=n||(o*0.3);var m;if(k>=d(q)){m=n/(2*i)*h(q/k)}else{k=q;m=n/4}return k*g(2,-10*l)*e((l*o-m)*(2*i)/n)+q+j},elasticBoth:function(l,j,q,o,k,n){if(l==0||(l/=o/2)==2){return l==0?j:j+q}n=n||(o*(0.3*1.5));var m;if(k>=d(q)){m=n/(2*i)*h(q/k)}else{k=q;m=n/4}return l<1?-0.5*(k*g(2,10*(l-=1))*e((l*o-m)*(2*i)/n))+j:k*g(2,-10*(l-=1))*e((l*o-m)*(2*i)/n)*0.5+q+j},backIn:function(k,j,n,m,l){l=l||1.70158;return n*(k/=m)*k*((l+1)*k-l)+j},backOut:function(k,j,n,m,l){if(!l){l=1.70158}return n*((k=k/m-1)*k*((l+1)*k+l)+1)+j},backBoth:function(k,j,n,m,l){l=l||1.70158;return((k/=m/2)<1)?n/2*(k*k*(((l*=(1.525))+1)*k-l))+j:n/2*((k-=2)*k*(((l*=(1.525))+1)*k+l)+2)+j},bounceIn:function(k,j,m,l){return m-f.Easing.bounceOut(l-k,0,m,l)+j},bounceOut:function(k,j,m,l){if((k/=l)<(1/2.75)){return m*(7.5625*k*k)+j}else{if(k<(2/2.75)){return m*(7.5625*(k-=(1.5/2.75))*k+0.75)+j}else{if(k<(2.5/2.75)){return m*(7.5625*(k-=(2.25/2.75))*k+0.9375)+j}}}return m*(7.5625*(k-=(2.625/2.75))*k+0.984375)+j},bounceBoth:function(k,j,m,l){return(k<l/2)?f.Easing.bounceIn(k*2,0,m,l)*0.5+j:f.Easing.bounceOut(k*2-l,0,m,l)*0.5+m*0.5+j}})})();(function(){var h=Ext.lib;h.Anim.color=function(p,n,q,r,m,o){return h.Anim.run(p,n,q,r,m,o,h.ColorAnim)};h.ColorAnim=function(n,m,o,p){h.ColorAnim.superclass.constructor.call(this,n,m,o,p)};Ext.extend(h.ColorAnim,h.AnimBase);var j=h.ColorAnim.superclass,i=/color$/i,f=/^transparent|rgba\(0, 0, 0, 0\)$/,l=/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,d=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,e=/^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i,g=function(m){return typeof m!=="undefined"};function k(n){var p=parseInt,o,m=null,q;if(n.length==3){return n}Ext.each([d,l,e],function(s,r){o=(r%2==0)?16:10;q=s.exec(n);if(q&&q.length==4){m=[p(q[1],o),p(q[2],o),p(q[3],o)];return false}});return m}Ext.apply(h.ColorAnim.prototype,{getAttr:function(m){var o=this,n=o.el,p;if(i.test(m)){while(n&&f.test(p=Ext.fly(n).getStyle(m))){n=n.parentNode;p="fff"}}else{p=j.getAttr.call(o,m)}return p},doMethod:function(s,m,o){var t=this,n,q=Math.floor,p,r,u;if(i.test(s)){n=[];o=o||[];for(p=0,r=m.length;p<r;p++){u=m[p];n[p]=j.doMethod.call(t,s,u,o[p])}n="rgb("+q(n[0])+","+q(n[1])+","+q(n[2])+")"}else{n=j.doMethod.call(t,s,m,o)}return n},setRunAttr:function(r){var t=this,u=t.attributes[r],v=u.to,s=u.by,n;j.setRunAttr.call(t,r);n=t.runAttrs[r];if(i.test(r)){var m=k(n.start),o=k(n.end);if(!g(v)&&g(s)){o=k(s);for(var p=0,q=m.length;p<q;p++){o[p]=m[p]+o[p]}}n.start=m;n.end=o}}})})();(function(){var d=Ext.lib;d.Anim.scroll=function(j,h,k,l,g,i){return d.Anim.run(j,h,k,l,g,i,d.Scroll)};d.Scroll=function(h,g,i,j){if(h){d.Scroll.superclass.constructor.call(this,h,g,i,j)}};Ext.extend(d.Scroll,d.ColorAnim);var f=d.Scroll.superclass,e="scroll";Ext.apply(d.Scroll.prototype,{doMethod:function(g,m,h){var k,j=this,l=j.curFrame,i=j.totalFrames;if(g==e){k=[j.method(l,m[0],h[0]-m[0],i),j.method(l,m[1],h[1]-m[1],i)]}else{k=f.doMethod.call(j,g,m,h)}return k},getAttr:function(g){var h=this;if(g==e){return[h.el.scrollLeft,h.el.scrollTop]}else{return f.getAttr.call(h,g)}},setAttr:function(g,j,i){var h=this;if(g==e){h.el.scrollLeft=j[0];h.el.scrollTop=j[1]}else{f.setAttr.call(h,g,j,i)}}})})();if(Ext.isIE){function a(){var d=Function.prototype;delete d.createSequence;delete d.defer;delete d.createDelegate;delete d.createCallback;delete d.createInterceptor;window.detachEvent("onunload",a)}window.attachEvent("onunload",a)}})();