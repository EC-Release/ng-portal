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
    
    port.onmessage = (e)=>{        
        let ws = new WebSocket(e.data);
        ws.binaryType = 'blob';
        ws.onmessage = (event)=>{
          //if (event.data.size>0){          
              port.postMessage(event.data);
          //}
        };
        
    }
}
