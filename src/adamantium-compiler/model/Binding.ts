import * as ts from 'typescript';

export enum BindingKind {
  Declared,
  Implicit
}

export class Binding {
  
  kind: BindingKind
  key: string
  from: ts.Type
  to: ts.Type
  
  constructor(kind: BindingKind, key: string, from: ts.Type, to: ts.Type) {
    this.kind = kind;
    this.key = key;
    this.from = from;
    this.to = to;
  }
  
  static declared(key: string, from: ts.Type, to: ts.Type) {
    return new Binding(BindingKind.Declared, key, from, to);
  }
  
  static implicit(key: string, from: ts.Type, to: ts.Type) {
    return new Binding(BindingKind.Declared, key, from, to);
  }
  
}
