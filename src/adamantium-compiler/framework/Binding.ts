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
  
}
