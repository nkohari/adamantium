import * as ts from 'typescript';

export enum StubMethodKind {
  Bind,
  Get,
  GetAll
}

export interface StubMethodCall {
  kind: StubMethodKind
  fileName: string
  node: ts.CallExpression
  target: string
  typeArguments: ts.Type[]
  arguments: string[]
}

const StubKindMap = {
  'bind':   StubMethodKind.Bind,
  'get':    StubMethodKind.Get,
  'getAll': StubMethodKind.GetAll
}

const StubReplacementMap = {
  [StubMethodKind.Bind]:   'weakBind',
  [StubMethodKind.Get]:    'weakGet',
  [StubMethodKind.GetAll]: 'weakGetAll'
};

export function isStubMethod(name: string): boolean {
  return StubKindMap[name] !== undefined;
}

export function getStubMethodKind(name: string): StubMethodKind {
  return StubKindMap[name];
}

export function getStubReplacement(kind: StubMethodKind): string {
  return StubReplacementMap[kind];
}
