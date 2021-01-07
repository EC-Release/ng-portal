onconnect = (e)=>{
    let port = e.ports[0];

    /*port.onmessage = function(e) {
      var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
      port.postMessage(workerResult);
    }*/

    //port.start();
    //setInterval(()=>{
      //port.postMessage({status:'ok',time: new Date().toLocaleTimeString()});
    //},3000);
    
    port.onmessage = function(e) {        
        let ws = new WebSocket(e.data);
        ws.onmessage = function(event) {
          port.postMessage(event.data);
        };
        
    }
}
