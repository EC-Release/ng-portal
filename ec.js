class EC extends Base {
  constructor(id) {
      super();
      console.log(`EC id# ${id}`);
      this.Api().then((resp)=>{
 console.log(`Api(): ${resp}`);
}).catch((e)=>{
 console.log(`Exception: ${e}`);
});
  }
  
  Api(){
    return fetch('https://api.github.com/repos/ec-release/web-ui/contents/webui-assets/godoc');
  }
}
