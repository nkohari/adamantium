import * as ts from 'typescript';

class Component {
  
  key: string
  factory: ts.Signature
  dependencies: string[]
  
  constructor(key: string, factory: ts.Signature, dependencies: string[]) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
  }
  
}

export default Component;
