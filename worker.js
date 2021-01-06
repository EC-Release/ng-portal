onconnect = (e)=>{
    let port = e.ports[0];

    /*port.onmessage = function(e) {
      var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
      port.postMessage(workerResult);
    }*/

    console.log('worker thread set interval')
    //port.start();
    setInterval(()=>{
      port.postMessage({status:'ok',time: new Date().toLocaleTimeString()});
    },3000);
}
