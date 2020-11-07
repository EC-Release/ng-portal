class EC extends Base {
  constructor(id) {
      super();
      console.log(`EC id# ${id}`);
      this.Api();
  }
  
  async Api(){
      const response = await fetch('https://api.github.com/repos/ec-release/web-ui/contents/webui-assets/godoc');
      const data = await response.json();  
  }
}
