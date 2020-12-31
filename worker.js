onmessage = (e)=>{
  console.log(`execute ec worker with detail ${e}`);
  location.reload();
  postMessage({"status":"ok"});
}
