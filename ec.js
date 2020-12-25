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

import Base from './base.js'

class EC extends Base {
  #sdk = "";
  #security = "";
  #releases = "";
  #ngObj = new Map();
  constructor(id,rev='v1.2beta',path='/ec',api='api') {
      super();
      console.log(`EC id# ${id}`);
      this.appRev = rev;
      this.appPath = `/${this.appRev}/ec`;
      this.apiPath = `/${this.appRev}/ec/${api}`;
      this.assetPath = `/${this.appRev}/assets`;
  }
  
  Api(url,detail){
    return fetch(url,detail)
    .then(resp => resp.json());
  }

  TenguDataConversionI(pk,pv){
    //let op = this.#ngObj[pk];
    pv["children"] = [];
    if (!pv.hasOwnProperty("name")) {
      pv["name"]=pk;
    }
   
    for (const [key, val] of this.#ngObj) {
      if (val["parent"]==pk) { 
         this.TenguDataConversionI(key,val);
         pv["children"].push(val);         
      }
    }
    if (pv["children"].length==0) {
      delete pv.children;
      if (!pv.hasOwnProperty("value")) {
        pv["value"]=10;
      }
    }
    //pt["children"].push(op);
  }

  TenguAPI(key,mtd='GET'){
    let obj = this.GetTenguAPIObj(mtd);
    let path=this.apiPath;
    if (key!='') path=`${path}/${key}`;
    return this.Api(path,obj).then(data=>{
      if (key!='') {
        this.#ngObj.set(key,data);
        return this.#ngObj.get(key);
      }
      
      return data;
    });
  }

  GetTenguAPIObj(mtd='GET'){
    let op = document.cookie.split("ec-config=");
    if (op.length<2) {
      console.log(`token expired. refresh browser.`);
      location.reload();
      return;
    }
    
    return {
      method: mtd,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${op[1]}`
      }
    };   
  }

  Html(url){
    return fetch(url)
    .then(resp => resp.text());
  }

  get ngObj() {
    return this.#ngObj;
  }

  set securityMd(c) {
    this.#security=c;
  }

  get securityMd() {
    return this.#security;
  }

  set sdkInnerHTML(c) {
    this.#sdk=c;
  }

  get sdkInnerHTML() {
    return this.#sdk;
  }

  set Releases(c) {
    this.#releases=c;
  }

  get Releases() {
    return this.#releases;
  }
  
}
export { EC as default };
