/*
 * Copyright (c) 2020 General Electric Company. All rights reserved.
 * The copyright to the computer software herein is the property of
 * General Electric Company. The software may be used and/or copied only
 * with the written permission of General Electric Company or in accordance
 * with the terms and conditions stipulated in the agreement/contract
 * under which the software has been supplied.
 *
 * author: apolo.yasuda@ge.com
 */

import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";

import define from "./analytics.js";
import {default as build} from "./build.js";

class Base {
    constructor(){}
    
    getToken(name) {
	const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);	 
	if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    windowEventBinder(){
        /*this.worker = new Worker(`${this.assetPath}/worker.js`);
        this.worker.onmessage = (e)=>{
          console.log(`worker comunication: ${e}`);
        }*/
        
        let idleTime = 0, _this=this;
        let ref3 = setInterval(()=>{     
            var ref1 = document.createElement('iframe');                    
            ref1.style.display = 'none';                    
            ref1.onload = ()=>{ ref1.parentNode.removeChild(ref1); };                    
            ref1.src = `${_this.appPath}`;                    
            document.body.appendChild(ref1);
            console.log(`auth cookie refreshed.`);                
        }, 1080*1000);
        
        let ref2 = setInterval(()=>{
            idleTime++;
            if (idleTime > 16) {
                clearInterval(ref3);
                console.log(`auth expiring soon`);
            }
        }, 60000);
        
        $(document).on('mousedown mousemove keypress scroll touchstart',()=>{
            idleTime = 0;
        });
        
    }
    
    load(src) {
        return new Promise((resolve,reject)=>{
            var s;
            s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        }
        );
    }
    routing(){
        let op=window.location.pathname;
        switch (op) {
          case `${this.appPath}/godoc`:
            $('ul > li.ec-godoc').click();
            break;
          case `${this.appPath}/scheduler`:
            $('ul > li.ec-scheduler').click();
            break;
          case `${this.appPath}/releases`:
            $('ul > li.ec-releases').click();
            break;
          case `${this.appPath}/security`:
            $('ul > li.ec-security').click();
            break;
          case `${this.appPath}/status`:
            $('ul > li.ec-status').click();
            break;
          case `${this.appPath}/analytics`:
            $('ul > li.ec-analytics').click();
            break;
          case `${this.appPath}/communicator`:
            $('ul > li.ec-communicator').click();
            break;
          default:
        }
    }
    
    setActiveTab(elm,path) {
        $("ul>li>a.active").removeClass("active");
        $(elm).addClass('active');
        this.setActiveState(elm,path);
    }
    setActiveState(elm,uri) {
        history.replaceState({}, {}, uri);
    }
    
    getBoolIcon(ok,uri) {
        let html='';
        if (ok){
            html+=`${feather.icons['check-circle'].toSvg()}`;
        } else {
            html+=`${feather.icons['circle'].toSvg()}`;
        }
        return `<a href="${this.assetPath}/${uri}" class="ec-godoc-rev">${html}</a>`;
    }
 
    setBlock(){
        $("body").css("overflow", "hidden");
        $('body').append($('<div class="ec-block"></div>').css({
         //width: $('body')[0].getBoundingClientRect().width,
         //height: $('body')[0].getBoundingClientRect().height,
         width: '100%',
         height: '100%',
         opacity: 0.6,
         top: window.pageYOffset,
         left: window.pageXOffset,
         position: "absolute",
         "z-index": 5000,
         display: "block",
         background: "black"
        }).on("click", (e)=>{
         e.preventDefault();
         
         this.hideDataModel();
         this.hideRemoteDebug();
         this.hideTerminal();
	 this.hideSchedulerForm();
        }).on("touchstart touchmove scroll", (e)=>{
         e.preventDefault();
        }));     
    }
 
    unsetBlock(){
        $('.ec-block').remove();
        $("body").css("overflow", "auto");
    }
    
    hideTerminal(){
        this.ws&&this.ws.close();
        $('.ec-xterm').remove();
        this.unsetBlock();
        
    }
    
    hideRemoteDebug(){
        this.ws&&this.ws.close();
        $('.ec-xdbg').remove();
        this.unsetBlock();
        
    }
    
    showRemoteDebug(url){
        if (document.getElementsByClassName("ec-xdbg").length>0)
            return;
        
        this.setBlock();
        let _this=this;
        
        $('body').append($('<div class="ec-xdbg" id="ec-xdbg"></div>').css({
         //width: 640,
         //height: 480,
         position: 'fixed',
         top: '50%',
         left: '50%',
         transform: 'translate(-50%, -50%)',
         'z-index': 5001,
         'background-color': 'whitesmoke',
         'border-radius': 3
        }));
        
        this.ws = new WebSocket(url);
        /*ws.onmessage = (event)=>{
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
               port.postMessage(reader.result);
            });
            reader.readAsArrayBuffer(event.data);
        };*/
        
        this.ws.onerror = (e)=>{
            console.log("socket error", e);          
        };
        
        this.ws.onopen = (e)=>{
            const t = new Terminal({cols:100,rows:40,convertEol:true}),
                  f = new FitAddon.FitAddon();
            t.loadAddon(f);
            t.open(document.getElementById('ec-xdbg'));

            //t.on('title', (title)=>{ document.title = title;});

            //term.on('data', function(data) {
            //  sock.send(btoa(data));
            //});

            this.ws.onmessage = (msg)=>{
                
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                   t.write(reader.result);
                });
                reader.readAsText(msg.data);

            };
        };
        
        
    }
    
    showTerminal(url){
        if (document.getElementsByClassName("ec-xterm").length>0)
            return;
        
        this.setBlock();
        let _this=this,
            ab2str=(buf)=>{
                return String.fromCharCode.apply(null, new Uint8Array(buf));
            };
        
        $('body').append($('<div class="ec-xterm" id="ec-xterm"></div>').css({
         //width: 640,
         //height: 480,
         position: 'fixed',
         top: '50%',
         left: '50%',
         transform: 'translate(-50%, -50%)',
         'z-index': 5001,
         'background-color': 'whitesmoke',
         'border-radius': 3
        }));
        
        
        this.ws = new WebSocket(url);
        
        this.ws.onerror = (e)=>{
            console.log("socket error", e);          
        };
        
        this.ws.onopen = (e)=>{
            const t = new Terminal({
                cols:100,
                rows:40,
                convertEol:true,
                screenKeys: true,
                useStyle: true,
                cursorBlink: true}),
            f = new FitAddon.FitAddon();
            t.loadAddon(f);
            t.open(document.getElementById('ec-xterm'));            
			//t.fit();

            //t.on('title', (title)=>{ document.title = title;});

            //term.on('data', function(data) {
            //  sock.send(btoa(data));
            //});
            
            t.onData(data=>{
                this.ws.send(new TextEncoder().encode("\x00" + data));
            });
            
            t.onResize(evt=>{
                this.ws.send(new TextEncoder().encode("\x01" + JSON.stringify({cols: evt.cols, rows: evt.rows})))
            });
            
            t.onTitleChange(title=>{
                document.title = title;
            });
            
            this.ws.onmessage = (msg)=>{
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                   t.write(reader.result);
                });
                reader.readAsText(msg.data);
            };
            
            this.ws.onclose = (evt)=>{
                t.write("session terminated");
                t.dispose();
            }

    		this.ws.onerror = (e)=>{
                console.log("socket error", e);          
            }
        };
    }

    hideSchedulerForm(){
        $('.ec-scheduler-form').remove();
        this.unsetBlock();
    }
	
    showSchedulerForm(){
	if (document.getElementsByClassName("ec-scheduler-form").length>0)
            return;
        
        this.setBlock();
        let _this=this;
	    
	$('body').append($('<div class="ec-scheduler-form"></div>').css({
         width: 640,
         height: 480,
         position: 'fixed',
         top: '50%',
         left: '50%',
         transform: 'translate(-50%, -50%)',
         'z-index': 5001,
         'background-color': 'whitesmoke',
         'border-radius': 3
        }).html(`<form>
  <div class="form-group">
    <label for="exampleFormControlInput1">Email address</label>
    <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
  </div>
  <div class="form-group">
    <label for="exampleFormControlSelect1">Example select</label>
    <select class="form-control" id="exampleFormControlSelect1">
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </select>
  </div>
  <div class="form-group">
    <label for="exampleFormControlSelect2">Example multiple select</label>
    <select multiple class="form-control" id="exampleFormControlSelect2">
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </select>
  </div>
  <div class="form-group">
    <label for="exampleFormControlTextarea1">Example textarea</label>
    <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
  </div>
</form>`));
           
    }
    
    showDataModel(){
        if (document.getElementsByClassName("ec-data-model").length>0)
            return;
        
        this.setBlock();
        let _this=this,aq={};
        
        $('body').append($('<div class="ec-data-model"></div>').css({
         width: 640,
         height: 480,
         position: 'fixed',
         top: '50%',
         left: '50%',
         transform: 'translate(-50%, -50%)',
         'z-index': 5001,
         'background-color': 'whitesmoke',
         'border-radius': 3
        }));
            
        const options = {
         //mode: 'form',
         //modes: ['form', 'text', 'view'],
         //modes: ['code', 'form', 'text', 'view', 'preview'],
         language: 'en',
         name: "ec-ng-data-visual",
         onError: (err)=>{
          console.error(`err: ${err}`);
         },
         onCreateMenu: (items, node)=>{
             items.forEach((item, index, items)=>{
                 switch (item.className) {
                    case 'jsoneditor-remove':
                        let op = item.click;
                        item.click = ()=>{
                            op();
                            let obj = {
                                path: node.path,
                                method: 'PUT'
                            };
                            if (node.path[node.path.length-2]=='children')
                              obj.method='DELETE';
                            
                            _this.updateJsonNodeOps(aq, obj);
                            if (Object.keys(aq).length > 0) {
                                $('#ec-apply-button').removeAttr('disabled');
                            }
                        }
                    /*case 'jsoneditor-insert':
                        let op1 = item.click;
                        item.click = ()=>{
                            op1();
                        }
                        if ('submenu' in item) {
                            items.forEach((sitem, index, item.submenu)=>{
                                let op2 = sitem.click;
                                sitem.click = ()=>{
                                    op2();
                                }
                            }
                        }*/
                    }
             });
             return items;
         },
         //onTextSelectionChange: function(start, end, text) {
         //    console.log(`start: ${start}, end: ${end}, text: ${text}`);
         //},
         //onSelectionChange: function(start, end) {
         //    console.log(`start: ${start}, end: ${end}`);
         //},
         onEvent: function(node, event) {
          if (event.type == 'blur' && node.field && node.value) {
           let obj = {
               path: node.path,
               method: 'PUT'
           };
           _this.updateJsonNodeOps(aq,obj);
           if (Object.keys(aq).length>0) {
               $('#ec-apply-button').removeAttr('disabled');
           }    
          }
         }        
        }
         
        this.editor = new JSONEditor($('.ec-data-model')[0],options);
        this.editor.set(this.ngData);
        $('.jsoneditor-menu').append($('<button type="button" class="jsoneditor-repair" title="apply" id="ec-apply-button" disabled></button>').on("click", (e)=>{
         e.preventDefault();
         for (const _k in aq) {             
             let _v = aq[_k];
             if (!_v.value.hasOwnProperty('parent'))
               console.error(`invalid keyvalue pair ${_v.value}`);
                 
             _this.TenguAPI(_v.key,_v.value,_v.method).then(data=>{
               
               if (_v.method=='DELETE'){
                   _this.delNgObj(_v.key);
               } else {
                   _this.setNgObj(_v.key,data);
               }
               this.TenguDataInit('qa');
               console.log(`return data: ${data}`);
             }).catch((e)=>{
               console.log(`Exception: ${e}`);
             });
         }
         aq={};
         console.log('db updated');
         $('#ec-apply-button').prop("disabled", true);
        }));
        
        //const updatedJson = editor.get();     
    }
 
    hideDataModel(){
        $('.ec-data-model').remove();
        this.unsetBlock();
    }
 
    showTenguChartI(){
     this.TenguDataInit('qa');
     $("main").html('<div class="chart mx-5 my-5"></div>');
     (new Runtime).module(define, name=>{
      if (name === "chart")
       return Inspector.into(".chart")();
     });
    }
    
    showTenguChartII(){
     //this.TenguDataInit('qa');
     $("main").html('<div class="chart mx-5 my-5"></div>');
     (new Runtime).module(build, name=>{
      if (name === "chart")
       return Inspector.into(".chart")();
     });
    }
}

export { Base as default };
