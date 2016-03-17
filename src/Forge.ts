abstract class Forge {
  
  static _adamantium: boolean = true
  protected components: {};
  
  get<TService>() {
  }
  
  protected bind<TService, TComponent>() {
  }
  
  protected abstract load();
  
  private _bind(service: string, component: string) {
  }
  
}

export default Forge;
