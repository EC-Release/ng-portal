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

var appRev = 'v1.2beta',
    appPath = '/'+appRev+'/ec',
    assetPath = '/'+appRev+'/assets';
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
    setActiveTab(elm) {
        $("ul>li>a.active").removeClass("active");
        $(elm).addClass('active');
        this.setActiveState(elm,$(elm).attr('href'));
    }
    setActiveState(elm,uri) {
        history.pushState({}, {}, uri);
    }
    getBoolIcon(ok,uri) {
        return `<a href="${assetPath+'/'+uri}" class="list-group-item list-group-item-action ec-godoc-rev" data-toggle="collapse">`
              +`<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">`
              +`<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>`
              +`<path fill-rule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/></svg></a>`;
    }
}

(()=>{
    let d = new Base();
    d.load("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js").catch((err)=>{}
    ).then((success)=>{

        d.load(assetPath+"/ec.js").catch((err)=>{}
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

            let ec = new EC("ec1");

            $('ul').on('click', 'li.ec-godoc', (event)=>{

                ec.setActiveTab(event.target);

                event.preventDefault();
                if (ec.sdkInnerHTML != "") {
                    $("main").html(ec.sdkInnerHTML);
                    return;
                }

                ec.Api('https://api.github.com/repos/ec-release/ng-webui/contents/godoc').then((data)=>{
                    let htmlString = `<table class="table"><caption>SDK Matrix</caption><thead><tr>`
                                   + `<th scope="col">Rev</th>`
                                   + `<th scope="col">Go</th>`
                                   + `<th scope="col">Java</th>`
                                   + `<th scope="col">C++</th>`
                                   + `<th scope="col">NodeJS</th>`
                                   + `</tr></thead><tbody>`;
                    for (let file of data) {
                        if (file.type == "dir") {
                            htmlString += `<tr><th scope="row">${file.name}</th>`
                                        + `<td>${ec.getBoolIcon(true,file.path)}</td>`
                                        + `<td>${ec.getBoolIcon(true,file.path)}</td>`
                                        + `<td>${ec.getBoolIcon(true,file.path)}</td>`
                                        + `<td>${ec.getBoolIcon(true,file.path)}</td>`
                                        + `</tr>`;
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

            $('main').on('click', 'a.ec-godoc-rev', (event)=>{
                event.preventDefault();
                ec.setActiveState(event.target,appPath+'/godoc/'+$(event.target).text());
                $("main").html(`<div class="embed-responsive embed-responsive-16by9 mt-3"><iframe class="embed-responsive-item" src="${event.target.href}" allowfullscreen></iframe></div>`);
                
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
