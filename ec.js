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

class EC extends Base {
  #sdk = "";
  
  constructor(id) {
      super();
      console.log(`EC id# ${id}`);
  }
  
  Api(url){
    return fetch(url)
    .then(resp => resp.json());
  }

  Html(url){
    return fetch(url)
    .then(resp => resp.text());
  }

  set sdkInnerHTML(c) {
    this.#sdk=c;
  }

  get sdkInnerHTML() {
    return this.#sdk;
  }
  
}
