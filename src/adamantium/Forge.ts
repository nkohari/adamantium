import BindingMap from './BindingMap';
import {Binding, ComponentMetadataMap} from './types';

abstract class Forge {
  
  static _adamantium: boolean = true
  
  protected bindings: BindingMap;
  protected metadata: ComponentMetadataMap;
  
  constructor() {
    this.bindings = new BindingMap();
  }
  
  /**
   * Resolves an instance of the specified service.
   * @param TService The service to resolve
   */
  get<TService>(): TService {
    throw new Error("Stub get() method was called. Did you run the adamantium compiler?");
  }
  
  /**
   * Resolves all possible instances of the specified service.
   * @param TService The service to resolve
   */
  getAll<TService>(): TService[] {
    throw new Error("Stub get() method was called. Did you run the adamantium compiler?");
  }
  
  /**
   * Binds the specified service to the specified component.
   * @param TService   The service to bind from
   * @param TComponent The component to bind to
   */
  bind<TService, TComponent extends TService>() {
    throw new Error("Stub bind() method was called. Did you run the adamantium compiler?");
  }
  
  /**
   * Loads the bindings for the forge. Inheritors should implement this method
   * and call bind().
   */
  protected abstract load();
  
  private getBindings(): Binding[] {
    return null;
  }
  
  private weakGet(service: string): any {
    return null;
  }
  
  private weakGetAll(service: string): any[] {
    return null;
  }
  
  private weakBind(service: string, component: string): void {
  }
  
}

export default Forge;
