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

import EC from './ec.js'
import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import {JSONEditor} from "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.1.6/jsoneditor.min.js";
import define from "./analytics.js";

(()=>{

    let ec = new EC('ec1');
    window.ec=ec;
    ec.load("https://code.jquery.com/jquery-3.5.1.slim.min.js").catch((err)=>{}
    ).then((s)=>{
        ec.load("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js").catch((err)=>{}
        ).then((success)=>{

            showdown.extension('header-anchors', ()=>{

                var ancTpl = '$1<a id="user-content-$3" class="anchor" href="#$3" aria-hidden="true"><svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>$4';

                return [{
                    type: 'html',
                    regex: /(<h([1-5]) id="([^"]+?)">)(.*<\/h\2>)/g,
                    replace: ancTpl
                }];
            }
            );

            let marked = new showdown.Converter({
                extensions: ['header-anchors'],
                ghCompatibleHeaderId: true
            });

            $('ul').on('click', 'li.ec-godoc', (event)=>{

                ec.setActiveTab(event.target);

                event.preventDefault();
                if (ec.sdkInnerHTML != "") {
                    $("main").html(ec.sdkInnerHTML);
                    return;
                }

                ec.Api('https://api.github.com/repos/ec-release/ng-webui/contents/godoc').then((data)=>{
                    let htmlString = `<table class="table text-center"><caption>Agent SDK Matrix</caption><thead><tr>` + `<th scope="col" class="text-left">Rev</th>` + `<th scope="col">Go</th>` + `<th scope="col">Java</th>` + `<th scope="col">C++</th>` + `<th scope="col">NodeJS</th>` + `</tr></thead><tbody>`;
                    for (let file of data) {
                        if (file.type == "dir") {
                            htmlString += `<tr><th scope="row" class="text-left">${file.name}</th>` + `<td>${ec.getBoolIcon(true, file.path)}</td>` + `<td>${ec.getBoolIcon(false, file.path)}</td>` + `<td>${ec.getBoolIcon(true, file.path)}</td>` + `<td>${ec.getBoolIcon(false, file.path)}</td>` + `</tr>`;
                        }
                    }
                    htmlString += '</tbody></table>';
                    ec.sdkInnerHTML = htmlString;
                    $("main").html(ec.sdkInnerHTML);
                    $(event.target).addClass('active');
                }
                ).catch((e)=>{
                    console.log(`Exception: e}`);
                }
                );
            }
            );

            $('ul').on('click', 'li.ec-releases', (event)=>{

                ec.setActiveTab(event.target);

                event.preventDefault();
                if (ec.Releases != "") {
                    $("main").html(ec.Releases);
                    return;
                }

                ec.Api('https://api.github.com/repos/ec-release/sdk/releases').then((data)=>{
                    let htmlString = `<table class="table"><caption>Release Matrix</caption><thead><tr><th scope="col">Rev</th><th scope="col">Release Note</th></tr></thead><tbody>`;
                    for (let rel of data) {
                        htmlString += `<tr><th scope="row">${rel.name}</th><td>${marked.makeHtml(rel.body)}</td></tr>`;
                    }
                    htmlString += '</tbody></table>';
                    ec.Releases = htmlString;
                    $("main").html(ec.Releases);
                    $(event.target).addClass('active');
                }
                ).catch((e)=>{
                    console.log(`Exception: ${e}`);
                }
                );
            }
            );

            $('ul').on('click', 'li.ec-security', (event)=>{
                ec.setActiveTab(event.target);
                event.preventDefault();

                if (ec.securityMd != "") {
                    $("main").html(marked.makeHtml(ec.securityMd));
                    $(event.target).addClass('active');

                    return;
                }

                ec.Html('https://raw.githubusercontent.com/EC-Release/sdk/v1_security_review/vulnerability/predix.README.md').then((data)=>{

                    ec.securityMd = '<div class="mt-3">' + marked.makeHtml(data) + '</div>';
                    $("main").html(ec.securityMd);
                    $(event.target).addClass('active');
                }
                );
            }
            );

            $('ul').on('click', 'li.ec-analytics', (event)=>{
                ec.setActiveTab(event.target);
                event.preventDefault();

                $('body').append($('<div class="ec-info"></div>')
                      .css({position: "fixed",left: $('body')[0].getBoundingClientRect().width-100, bottom: 20, color: 'grey'}).text('[ + data ]')
                      .on( "click", ()=>{
                    $('body').append($('<div class="ec-block"></div>')
                      .css({width:$('body')[0].getBoundingClientRect().width,height:$('body')[0].getBoundingClientRect().height,opacity:0.8,top:$('body')[0].getBoundingClientRect().top,left:$('body')[0].getBoundingClientRect().left,position:"absolute","z-index":5000,display:"block",background:"black"})
                      .on("click", ()=>{
                        
                      //$('.ec-info').remove();
                      $('.ec-data-model').remove();
                      $('.ec-block').remove();
                      
                    }));
                    $('body').append($('<div class="ec-data-model"></div>')
                      .css({width: 640,height: 480,position: 'fixed',top: '50%',left: '50%',transform: 'translate(-50%, -50%)','z-index': 5001,'background-color': 'whitesmoke','border-radius': 3}));
                }));
   
                let strMapToObj=(strMap)=>{
                    let obj = Object.create(null);
                    for (let [k,v] of strMap) {
                        obj[k] = v;
                    }
                    return obj;
                }
                
                ec.TenguAPI('','GET').then(data1=>{
                    for (const val of data1) {
                         ec.TenguAPI(val,'GET').then(data=>{
                             if (ec.ngObj.size==data1.length){
                                 
                                 let pv={
                                     name: "flare"
                                 };
                                 //console.log(`the map ${JSON.stringify(pv)}`);
                                 ec.TenguDataConversionI("qa",pv);
                                 window.ngData=pv;
                                 $("main").html('<div class="chart mx-5 my-5"></div>');
                                 (new Runtime).module(define, name => {
                                     if (name === "chart") return Inspector.into(".chart")();
                                 });
                                 $(event.target).addClass('active');
                             }
                         }).catch(e=>{console.log(`Exception ${e}`);});
                    }
          
                    
                }).catch((e)=>{
                     console.log(`Exception: ${e}`);
                });
                
            });

            $('main').on('click', 'a.ec-godoc-rev', (event)=>{
                event.preventDefault();
                let p = $(event.target).parents('a')[0]
                  , h = p.href.split("/").pop();
                ec.setActiveState(event.target.parentNode, ec.appPath + '/godoc/' + h);
                $("main").html(`<div class="embed-responsive embed-responsive-16by9 mt-3"><iframe class="embed-responsive-item" src="${p.href}" allowfullscreen></iframe></div>`);
            }
            );

            ec.routing();
        }
        , (failure)=>{}
        );
    }
    , (failure)=>{}
    );
}
)();
