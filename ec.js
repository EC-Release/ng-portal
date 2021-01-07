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
  #ngData = {};
  constructor(id,host,rev='v1.2beta',path='ec',api='api') {
      super();
      console.log(`EC id# ${id}`);
      this.appHost = host;
      this.appRev = rev;
      this.appPath = `/${this.appRev}/${path}`;
      this.apiPath = `/${this.appRev}/${path}/${api}`;
      this.assetPath = `/${this.appRev}/assets`;
  }
  
  attachWorker(f){
    this.worker = new SharedWorker(f); 
    this.worker.port.onmessage = (e)=>{
      console.log(`${e.data}`);
    }
    this.worker.port.postMessage(`wss://${location.host+this.appPath}/log`);
  }

  Api(url,detail){
    return fetch(url,detail)
    .then(resp => resp.json());
  }
 
  TenguDataInit(pkey){
    let pv = ec.TenguDataConversionI(pkey);
    this.#ngData = pv;
  }

  TenguDataConversionI(pk){
    let pv = this.getNgObjVal(pk);
    
    if (pv==undefined)
      return {};
    
    pv["children"] = [];
    if (!pv.hasOwnProperty("name")) {
      pv["name"]=pk;
    }
   
    for (const [key, val] of this.#ngObj) {
      if (val["parent"]==pk) { 
         let _pv = this.TenguDataConversionI(key);
         pv["children"].push(_pv);         
      }
    }

    if (pv["children"].length==0) {
      delete pv.children;
      if (!pv.hasOwnProperty("value")) {
        pv["value"]=10;
      }
    }
    return pv;
  }

  TenguAPI(key,val='',mtd='GET'){
    let obj = this.GetTenguAPIObj(mtd);
    let path=this.apiPath;
    
    if (val!='') {
      obj.body=JSON.stringify(val);
    }
    
    if (key!='') path=`${path}/${key}`;
    return this.Api(path,obj).then(data=>{
      if (key!='') {
        if (obj.method=='DELETE') {
          this.#ngObj.delete(key);
        } else {
          this.#ngObj.set(key,data);
          return this.#ngObj.get(key);
        }
      }
      
      return data;
    });
  }

  TenguSeederAPI(epath,mtd='GET'){
    let obj = this.GetTenguAPIObj(mtd);    
    return this.Api(epath,obj);
  }

  GetTenguAPIObj(mtd='GET'){
    let op = this.tokenChecker();
    
    return {
      method: mtd,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${op}`
      }
    };   
  }
     
  updateJsonNodeOps(aq,obj){  
    let sp = this.#ngData; 
    let lp = this.editor.get();

    obj.path.forEach((elm,idx)=>{
      if (sp&&sp['name']!=undefined&&
          lp&&lp['name']==sp['name']){
          obj.key=sp['name'];
          obj.value = this.cloneNgObjVal(lp);
      } else if (obj.path[idx-2]=='children'&&
         idx==obj.path.length-1){
          obj.method='POST'
          obj.value = this.cloneNgObjVal(lp);
          obj.value['parent']=obj.key;
          obj.key=obj.path.join('-');
      } else if (obj.path[idx-1]=='children'&&
            idx==obj.path.length-1&&obj.method=='DELETE'){
          obj.key=sp[obj.path[idx]]['name'];
      }

      sp=(sp&&sp[elm]);
      lp=(lp&&lp[elm]);

    });

    aq[`${obj.key}-${obj.method}`]=obj;
  }

  Html(url){
    return fetch(url)
    .then(resp => resp.text());
  }

  cloneNgObjVal(obj){
    let _s = JSON.parse(JSON.stringify(obj));
    delete _s.children;
    //delete _s.audit;
    return _s;
  }

  getNgObjVal(k) {
    let _k = JSON.parse(JSON.stringify(this.#ngObj.get(k)));
    return _k;
  }
  
  setNgObj(key,val) {
    this.#ngObj.set(key,val);
  }

  delNgObj(key) {
    this.#ngObj.delete(key);
  }
  
  get ngObjSize() {
    return this.#ngObj.size;
  }

  get ngData() {
    return this.#ngData;
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
