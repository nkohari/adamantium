import BindingMap from './BindingMap';
import {Binding} from './types';

export default class Forge {
  
  protected bindings: BindingMap;
  
  constructor() {
    
  }
  
  get<TService>(): TService {
    throw new Error("Stub get() method was called. Did you run the adamantium compiler?");
  }
  
  getAll<TService>(): TService[] {
    throw new Error("Stub getAll() method was called. Did you run the adamantium compiler?");
  }
  
  bind<TService, TComponent extends TService>() {
    throw new Error("Stub bind() method was called. Did you run the adamantium compiler?");
  }
  
  private addBinding(from: string, to: string) {
  }
  
  private addComponent(key: string, ctor: Function, dependencies: string[]) {
  }
  
  private getBindings(): Binding[] {
    return null;
  }
  
  private resolve(service: string): any {
    return null;
  }
  
  private resolveAll(service: string): any[] {
    return null;
  }
  
}
