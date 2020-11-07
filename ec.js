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
  constructor(id) {
      super();
      console.log(`EC id# ${id}`);
      this.Api().then((resp)=>{
 console.log(`Api(): ${JSON.stringify(resp)}`);
}).catch((e)=>{
 console.log(`Exception: ${JSON.stringify(e)}`);
});
  }
  
  Api(){
    return fetch('https://api.github.com/repos/ec-release/web-ui/contents/webui-assets/godoc');
  }
}
