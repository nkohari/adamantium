import * as ts from 'typescript';
import {Binding, Component, MagicMethodCall} from './';

export class Container {
  
  id: number
  name: string
  node: ts.Identifier
  declaration: ts.VariableDeclaration
  calls: MagicMethodCall[]
  bindings: { [key: string]: Binding[] }
  components: { [key: string]: Component }
  
  constructor(id: number, name: string, node: ts.Identifier, declaration: ts.VariableDeclaration) {
    this.id = id;
    this.name = name;
    this.node = node;
    this.declaration = declaration;
    this.calls = [];
    this.bindings = {};
    this.components = {};
  }
  
  addCall(call: MagicMethodCall) {
    this.calls.push(call);
  }
  
  addComponent(component: Component) {
    this.components[component.key] = component;
  }
  
  addBinding(binding: Binding) {
    let list = this.bindings[binding.key];
    if (!list) {
      list = this.bindings[binding.key] = [];
    }
    list.push(binding);
  }
  
  hasBindings(key: string): boolean {
    return this.bindings[key] !== undefined;
  }
  
  getBindings(key?: string): Binding[] {
    if (key !== undefined) {
      return this.bindings[key] || [];
    }
    else {
      let bindings = [];
      for (const key of Object.keys(this.bindings)) {
        bindings = bindings.concat(this.bindings[key]);
      }
      return bindings;
    }
  }
  
  getCalls(): MagicMethodCall[] {
    return this.calls;
  }
  
  getComponents(): Component[] {
    let components = [];
    for (const key of Object.keys(this.components)) {
      components.push(this.components[key]);
    }
    return components;
  }
  
}
