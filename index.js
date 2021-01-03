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

(()=>{

    let _s = window.location.pathname.split('/'),
        ec = new EC('ec1',_s[1],_s[2]);
    window.ec = ec;
    ec.load("https://code.jquery.com/jquery-3.5.1.slim.min.js").catch((err)=>{}
    ).then((s)=>{        
        ec.windowEventBinder();
        
        ec.load("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js").catch((err)=>{}
        ).then((success)=>{

            showdown.extension('header-anchors', ()=>{

                var ancTpl = '$1<a id="user-content-$3" class="anchor" href="#$3" aria-hidden="true"><svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>$4';

                return [{
                    type: 'html',
                    regex: /(<h([1-5]) id="([^"]+?)">)(.*<\/h\2>)/g,
                    replace: ancTpl
                }];
            });

            let marked = new showdown.Converter({
                extensions: ['header-anchors'],
                ghCompatibleHeaderId: true
            });
            
            ec.TenguAPI('', '', 'GET').then(data1=>{
                for (const val of data1) {
                    ec.TenguAPI(val, '', 'GET').then(data=>{
                        if (ec.ngObjSize>=data1.length) {
                            console.log(`all keys: ${data1} added. continue geo analysis.`);
                            return ec.TenguAPI('ip', '', 'GET').then(data1=>{
                                let ay=ec.getNgObjVal('ay');
                                data1.list.split(', ').forEach((ip)=>{
                                    if (!ip.startsWith('10.')){
                                        ec.Api(`${ay.cred.ipdata.url}/${ip}?${ay.cred.ipdata.key}=${ay.cred.ipdata.value}`).then((data)=>{                                   
                                            //console.log(`geo svc: ${data} browsHistory: ${ec.getNgObjVal('browseHistory')}`);
                                            let bh = ec.getNgObjVal('browseHistory'),
                                                ts = (new Date()).getTime();
                                            bh.list[`${ts}`]={
                                                ip:ip,
                                                lat:data.latitude,
                                                lng:data.longitude,
                                                city:data.city,
                                                country:data.country_name,
                                                zip:data.postal,
                                                state:data.region_code
                                            };
                                            return ec.TenguAPI('browseHistory',bh,'POST').then((data)=>{
                                                console.log(`geolocation updated. ${JSON.stringify(data)}`);
                                            });
                                        }).catch(e=>{
                                            console.log(`Exception: ${e}`);
                                        });
                                    }
                                });
                               
                            }).catch((e)=>{
                                throw e;
                            });                
                        }
                    }).catch(e=>{
                        console.log(`Exception: ${e}`);
                    });
                }
            }).catch((e)=>{
                console.log(`Exception: ${e}`);
            });
            
            $('ul').on('click', 'li.ec-godoc', (event)=>{

                ec.setActiveTab(event.target);

                event.preventDefault();
                if (ec.sdkInnerHTML != "") {
                    $("main").html(ec.sdkInnerHTML);
                    return;
                }

                ec.Api('https://api.github.com/repos/ec-release/ng-webui/contents/godoc').then((data)=>{
                    let htmlString = `<table class="table text-center table-striped"><caption>Agent SDK Matrix</caption><thead><tr>` + `<th scope="col" class="text-left">Rev</th>` + `<th scope="col">Go</th>` + `<th scope="col">Java</th>` + `<th scope="col">C++</th>` + `<th scope="col">NodeJS</th>` + `</tr></thead><tbody>`;
                    for (let file of data) {
                        if (file.type == "dir") {
                            htmlString += `<tr><th scope="row" class="text-left">${file.name}</th>` + `<td>${ec.getBoolIcon(true, file.path)}</td>` + `<td>${ec.getBoolIcon(false, file.path)}</td>` + `<td>${ec.getBoolIcon(true, file.path)}</td>` + `<td>${ec.getBoolIcon(false, file.path)}</td>` + `</tr>`;
                        }
                    }
                    htmlString += '</tbody></table>';
                    ec.sdkInnerHTML = htmlString;
                    $("main").html(ec.sdkInnerHTML);
                    $(event.target).addClass('active');
                }).catch((e)=>{
                    console.log(`Exception: ${e}`);
                });
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
                    let htmlString = `<table class="table table-striped"><caption>Release Matrix</caption><thead><tr><th scope="col">Rev</th><th scope="col">Release Note</th></tr></thead><tbody>`;
                    for (let rel of data) {
                        htmlString += `<tr><th scope="row">${rel.name}</th><td>${marked.makeHtml(rel.body)}</td></tr>`;
                    }
                    htmlString += '</tbody></table>';
                    ec.Releases = htmlString;
                    $("main").html(ec.Releases);
                    $(event.target).addClass('active');
                }).catch((e)=>{
                    console.log(`Exception: ${e}`);
                });
            });

            $('ul').on('click', 'li.ec-status', (event)=>{
                ec.setActiveTab(event.target);
                event.preventDefault();

                let tc = (ms)=>{
                    var currentdate = new Date(ms);
                    return currentdate.getFullYear() + "-"
                            + (currentdate.getMonth()+1)  + "-" 
                            + currentdate.getDate() + " "  
                            + currentdate.getHours() + ":"  
                            + currentdate.getMinutes() + ":" 
                            + currentdate.getSeconds();
                }
                
                let up = (url)=>{
                    var _u = new URL(url);
                    return _u.hostname.split('.')[0];
                }
                
                let st = (code)=>{
                    switch (code){
                        case 1006:
                            return feather.icons['sun'].toSvg({'color':'grey'});
                        case 1007:
                            return feather.icons['pause-circle'].toSvg({'color':'grey'});
                        case 1008:
                            return feather.icons['alert-triangle'].toSvg({'color':'grey'});                        
                        case 1009:
                            return feather.icons['eye-off'].toSvg({'color':'grey'});                        
                        default:
                            return feather.icons['help-circle'].toSvg({'color':'grey'});                                                                                
                    }
                }
                
                ec.TenguAPI('seed', '', 'GET').then(data=>{
                    let htmlString = `<table class="table text-center table-striped"><caption>System Mining</caption><thead><tr>` + 
                                    `<th scope="col" class="text-left">Seeder</th>` + 
                                    `<th scope="col">Ancestor</th>` + 
                                    `<th scope="col">OAuth</th>` + 
                                    `<th scope="col">Sequence</th>` + 
                                    `<th scope="col">Status</th>` + 
                                    `<th scope="col">Retry</th>` + 
                                    `<th scope="col">Reboot</th>` + 
                                    `<th scope="col">Updated On</th>` + 
                                    `<th scope="col">Joined On</th>` + 
                                    `</tr></thead><tbody>`;
                    for (const [key, seed] of Object.entries(data)) {
                        htmlString += `<tr><th scope="row" class="text-left"><a class="ec-seed-link" href="${seed.Node}">${up(seed.Node)}</a></th>` +
                            `<td><a class="ec-seed-link" href="${seed.Seed}">${up(seed.Seed)}</a></td>` + 
                            `<td><a class="ec-oauth-link" href="${seed.OAuth}">${up(seed.OAuth)}</a></td>` + 
                            `<td>${seed.SeqID}</td>` + 
                            `<td>${st(seed.Status)}</td>` + 
                            `<td>${seed.Retry}</td>` + 
                            `<td><a class="ec-seed-reboot" href="javascript:void(0)" ec-data="${seed.Node}">${feather.icons['refresh-cw'].toSvg({'color':'green'})}</a></td>` + 
                            `<td>${tc(seed.UpdatedOn*1000)}</td>` + 
                            `<td>${tc(seed.CreatedOn*1000)}</td>` + `</tr>`;
                    };
                    htmlString += '</table>';
                    
                    let bh = ec.getNgObjVal('browseHistory');
                    if (bh) {
                        htmlString += `<table class="table text-center table-striped"><caption>Usage Geo-reporting</caption><thead><tr>` +                 
                                        `<th scope="col" class="text-left">Visited On</th>` + 
                                        `<th scope="col">LAT</th>` + 
                                        `<th scope="col">LNG</th>` + 
                                        `<th scope="col">City</th>` + 
                                        `<th scope="col">State</th>` + 
                                        `<th scope="col">Zip</th>` + 
                                        `<th scope="col">Country</th>` + 
                                        `</tr></thead><tbody>`;                     

                        for (const [timeStmp, histry] of Object.entries(bh.list)) {           
                            htmlString += `<tr><th scope="row" class="text-left">${tc(parseInt(timeStmp))}</th>` +
                                    `<td>${histry.lat}</td>` + 
                                    `<td>${histry.lng}</td>` + 
                                    `<td>${histry.city}</td>` + 
                                    `<td>${histry.state}</td>` + 
                                    `<td>${histry.zip}</td>` + 
                                    `<td>${histry.country}</td></tr>`;
                        }
                        htmlString += '</table>';

                    }
                    $("main").html(htmlString);
                    $('.ec-seed-reboot > svg').on('click',(e)=>{
                        let _o=0,
                            ref2 = setInterval(()=>{
                                _o+=10;
                                $(e.target).css({transform:`rotate(${_o}deg)`});
                            }, 100),
                            ref3 = setInterval(()=>{
                                ec.TenguSeederAPI(`${ext}/api/seed`).then(d=>{
                                    clearInterval(ref2);
                                    clearInterval(ref3);
                                    console.log(`seeder ${ext} re-instated.`);
                                }).catch(e=>{
                                    console.log(`seeder ${ext} reboot in-progress.`);
                                });
                            }, 5000),
                            ext = $(e.target).parent().parent().attr('ec-data');
                        
                        ec.TenguSeederAPI(`${ext}/exit`).then(d=>{}).catch(e=>{
                            console.log(`seeder ${ext} is forcibly rebooting. ex: ${e}`);
                        });
                    });
                    
                    $(event.target).addClass('active');
                }).catch((e)=>{
                    console.log(`Exception: ${e}`);
                });
                
            });
            
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
                });
            });

            $('ul').on('click', 'li.ec-analytics', (event)=>{
                ec.setActiveTab(event.target);
                event.preventDefault();
                if (document.getElementsByClassName('ec-info').length<1) {                
                    $('body').append($('<div class="ec-info"></div>').css({
                        position: "fixed",
                        left: $('body')[0].getBoundingClientRect().width - 100,
                        bottom: 20,
                        color: 'grey'
                    }).text('[ + data@EC ]').on("click", (e)=>{
                        e.preventDefault();
                        ec.TenguDataInit('qa');
                        ec.showDataModel();
                    }));
                }
                
                if (ec.ngObjSize>0){
                    ec.showTenguChartI();
                    $(event.target).addClass('active');
                } else {
                    console.log(`no data obj available`);
                }
            });

            $('main').on('click', 'a.ec-godoc-rev', (event)=>{
                event.preventDefault();
                let p = $(event.target).parents('a')[0]
                  , h = p.href.split("/").pop();
                ec.setActiveState(event.target.parentNode, ec.appPath + '/godoc/' + h);
                $("main").html(`<div class="embed-responsive embed-responsive-16by9 mt-3"><iframe class="embed-responsive-item" src="${p.href}" allowfullscreen></iframe></div>`);
            });

            ec.routing();
        }, (failure)=>{});
    }, (failure)=>{});
    
})();
