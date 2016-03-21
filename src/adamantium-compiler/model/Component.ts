import * as ts from 'typescript';
import {Dependency} from './'

export class Component {
  
  key: string
  factory: ts.Signature
  dependencies: Dependency[]
  
  constructor(key: string, factory: ts.Signature, dependencies: Dependency[]) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
  }
  
}
