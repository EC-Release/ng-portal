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
    d.load("./assets/ec.js").catch((err)=>{}
    ).then((success)=>{

        let ec = new EC("ec1");

        $('ul').on('click', 'li.ec-godoc', (event)=>{
            event.preventDefault();
            if (ec.sdkInnerHTML != "") {
                $("main").html(ec.sdkInnerHTML);
                return;
            }

            ec.Api('https://api.github.com/repos/ec-release/web-ui/contents/webui-assets/godoc').then((data)=>{
                let htmlString = '<ul>';
                for (let file of data) {
                    if (file.type == "dir") {
                        htmlString += `<li><a href="/web-ui/${file.path}">${file.name}</a></li>`;
                    }
                }
                htmlString += '</ul>';
                ec.sdkInnerHTML = htmlString;
                $("main").html(ec.sdkInnerHTML);
            }
            ).catch((e)=>{
                console.log(`Exception: e}`);
            }
            );
        }
        );
    }
    , (failure)=>{}
    );

}
)();
