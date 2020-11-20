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
  constructor(id,rev='v1.2beta',path='/ec') {
      super();
      console.log(`EC id# ${id}`);
      this.appRev = rev;
      this.appPath = `/${this.appRev}/ec`;
      this.assetPath = `/${this.appRev}/assets`;
  }
  
  Api(url){
    return fetch(url)
    .then(resp => resp.json());
  }

  Html(url){
    return fetch(url)
    .then(resp => resp.text());
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
export {EC as default};
