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
}

(()=>{
    let d = new Base();
    d.load("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js").catch((err)=>{}
    ).then((success)=>{

        d.load("./assets/ec.js").catch((err)=>{}
        ).then((success)=>{

            let marked = new showdown.Converter();
            let ec = new EC("ec1");

            $('ul').on('click', 'li.ec-godoc', (event)=>{
                event.preventDefault();
                if (ec.sdkInnerHTML != "") {
                    $("main").html(ec.sdkInnerHTML);
                    return;
                }

                ec.Api('https://api.github.com/repos/ec-release/ng-webui/contents/godoc').then((data)=>{
                    let htmlString = `<div class="list-group d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">`;
                    for (let file of data) {
                        if (file.type == "dir") {
                            htmlString += `<a href="./assets/${file.path}" class="list-group-item list-group-item-action ec-godoc-rev">${file.name}</a>`;
                        }
                    }
                    htmlString += '</div>';
                    ec.sdkInnerHTML = htmlString;
                    $("main").html(ec.sdkInnerHTML);
                }
                ).catch((e)=>{
                    console.log(`Exception: e}`);
                }
                );
            }
            );
            
            $('ul').on('click', 'li.ec-security', (event)=>{
                event.preventDefault();
                
                if (ec.securityMd != "") {
                    $("main").html(marked.makeHtml(ec.securityMd));
                    return;
                }
                
                ec.Html('https://raw.githubusercontent.com/EC-Release/sdk/v1_security_review/vulnerability/predix.README.md').then((data)=>{
                    
                    ec.securityMd = data;
                    $("main").html(marked.makeHtml(data));
                    
                });
            });

            $('main').on('click', 'a.ec-godoc-rev', (event)=>{
                event.preventDefault();
                $("main").html(`<div class="embed-responsive embed-responsive-16by9 mt-3"><iframe class="embed-responsive-item" src="${event.target.href}" allowfullscreen></iframe></div>`);
                
                //ec.Html(event.target.href).then((data)=>{
                    //let op = atob(data.content);
                    //$("main").innerHTML = marked(op);                
                //}
                
            }
            )

        }
        , (failure)=>{}
        );

    }
    , (failure)=>{}
    );
}
)();
