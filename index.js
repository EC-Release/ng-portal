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
 constructor(){}
 load(src){
  return new Promise(function (resolve, reject) {
   var s;
   s = document.createElement('script');
   s.src = src;
   s.onload = resolve;
   s.onerror = reject;
   document.head.appendChild(s);
  }
 }
}

let d = new EC('ec1');
d.load("./ec.js")
 .catch((err)=>{})
 .then((success)=>{}, (failure)=>{});
