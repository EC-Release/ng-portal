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
