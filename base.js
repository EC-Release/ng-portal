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

class Base {
    constructor() {}
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
          case `${this.appPath}/releases`:
            $('ul > li.ec-releases').click();
            break;
          case `${this.appPath}/security`:
            $('ul > li.ec-security').click();
            break;
          case `${this.appPath}/analytics`:
            $('ul > li.ec-analytics').click();
            break;
          default:
        }
    }
    
    setActiveTab(elm) {
        $("ul>li>a.active").removeClass("active");
        $(elm).addClass('active');
        this.setActiveState(elm,$(elm).attr('href'));
    }
    setActiveState(elm,uri) {
        history.pushState({}, {}, uri);
    }
    getBoolIcon(ok,uri) {
        let html='';
        if (ok){
            html+=`<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">`
              +`<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>`
              +`<path fill-rule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/></svg></a>`;
        } else {
            html+=`<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-dash-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">`
              +`<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>`
              +`<path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>`;
        }
        return `<a href="${this.assetPath}/${uri}" class="ec-godoc-rev">${html}</a>`;
    }
 
    setBlock(){
        $("body").css("overflow", "hidden");
        $('body').append($('<div class="ec-block"></div>').css({
         width: $('body')[0].getBoundingClientRect().width,
         height: $('body')[0].getBoundingClientRect().height,
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
        }).on("touchstart touchmove scroll", (e)=>{
         e.preventDefault();
        }));     
    }
 
    unsetBlock(){
        $('.ec-block').remove();
        $("body").css("overflow", "auto");
    }
    
    showDataModel(){
        this.setBlock();
        //let ngData=this.ngData;
        let _this=this,
            aq = {};
     
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
                 if (item.className=='jsoneditor-remove') {
                     op=item.click.clone();
                     item.click = ()=>{
                         let obj = {
                             field: node.field,
                             value: node.value,
                             path: node.path,
                             method: 'DELETE'
                         };
                         _this.updateJsonNodeOps(aq,obj);
                         if (Object.keys(aq).length>0) {
                             $('#ec-apply-button').removeAttr('disabled');
                         }  
                     }
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
          if (event.type == 'blur' && node.field != undefined) {
           let obj = {
            field: node.field,
            value: node.value,
            path: node.path,
            method: 'POST'
           };
           _this.updateJsonNodeOps(aq,obj);
           if (Object.keys(aq).length>0) {
               $('#ec-apply-button').removeAttr('disabled');
           }    
          }
         }        
        }
         
        const editor = new JSONEditor($('.ec-data-model')[0],options);
        editor.set(this.ngData);
        $('.jsoneditor-menu').append($('<button type="button" class="jsoneditor-repair" title="apply" id="ec-apply-button" disabled></button>').on("click", (e)=>{
         e.preventDefault();
         for (const _k in aq) {             
             let _v = aq[_k];
             let _val=_this.ngObjVal(_v.key);
             _val&&(_val[_v.field]=_v.value);
             _this.TenguAPI(_v.key,_val,'POST').then(data=>{
               _this.setNgObjVal(_v.key,_v.field,_v.value);             
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
}

export { Base as default };
