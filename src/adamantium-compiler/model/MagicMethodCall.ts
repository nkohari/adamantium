import * as ts from 'typescript';

export enum MagicMethodKind {
  Bind = 1,
  Get = 2,
  GetAll = 3,
}

export interface MagicMethodCall {
  kind: MagicMethodKind
  fileName: string
  node: ts.CallExpression
  target: ts.Identifier
  targetName: string
  typeArguments: ts.Type[]
  arguments: string[]
}
