import {Binding, Component, Dependency} from './types';

export class Forge {
  
  protected bindings: { [key: string]: Binding[] };
  protected components: { [key: string]: Component };
  
  constructor() {
    this.bindings = {};
    this.components = {};
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
  
  private addBinding(key: string, component: string) {
    let list = this.bindings[key];
    if (!list) {
      list = this.bindings[key] = [];
    }
    list.push({key, component});
  }
  
  private addComponent(key: string, factory: Function, dependencies: Dependency[]) {
    this.components[key] = {key, factory, dependencies};
  }
  
  private resolve(key: string): any {
    const bindings = this.getBindings(key);
    
    if (bindings.length == 0) {
      throw new Error(`Somehow we're missing a binding for key ${key}. This shouldn't happen.`)
    }
    else if (bindings.length > 1) {
      // TODO: Multi-get
      throw new Error(`Couldn't resolve single binding for key ${key}.`)
    }
    
    const binding = bindings[0];
    const component = this.components[binding.component];
    const args = component.dependencies.map((dep) => this.resolve(dep.key));
    
    return this.createInstance(component.factory, args);
  }
  
  private resolveAll(key: string): any[] {
    // TODO: Multi-get
    return null;
  }
  
  private getBindings(key: string): Binding[] {
    return this.bindings[key] || [];
  }
  
  private createInstance(ctor: Function, args: any[]): any {
    return new (Function.prototype.bind.apply(ctor, [null].concat(args)));
  }
  
}
