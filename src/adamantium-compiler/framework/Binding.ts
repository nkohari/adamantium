import * as ts from 'typescript';

class Binding {
  
  key: string
  service: ts.Type
  component: ts.Type
  ctor: ts.Signature
  
  constructor(key: string, service: ts.Type, component: ts.Type) {
    this.key = key;
    this.service = service;
    this.component = component;
  }
  
}

export default Binding;
