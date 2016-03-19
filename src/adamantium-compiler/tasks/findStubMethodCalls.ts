import * as ts from 'typescript';
import {Project, StubMethodCall, StubMethodKind, isStubMethod, getStubMethodKind} from '../lang';

export default function findStubMethodCalls(project: Project): StubMethodCall[] {
  
  const languageService = project.getLanguageService();
  const checker = project.getTypeChecker();

  // TODO: Should look up by position in the (known) Forge.ts file instead of by name.
  const typeDecl = <ts.ClassDeclaration> project.findTypeDeclaration('Forge');
  
  const calls: StubMethodCall[] = [];
  
  for (const member of typeDecl.members) {
    if (member.kind == ts.SyntaxKind.MethodDeclaration) {
      const decl = <ts.MethodDeclaration> member;
      const name = checker.getSymbolAtLocation(decl.name).getName();
      if (isStubMethod(name)) {
        const kind = getStubMethodKind(name);
        for (const ref of project.findReferencesForNode(decl)) {
          calls.push(createStubMethodCall(kind, ref));
        }
      }
    }
  }
  
  return calls;
  
  function createStubMethodCall(kind: StubMethodKind, ref: ts.ReferenceEntry): StubMethodCall {
    
    const method = <ts.Identifier> project.getNodeAtPosition(ref.fileName, ref.textSpan.start);
    const call   = <ts.CallExpression> method.parent.parent;
    const target = (<ts.PropertyAccessExpression> call.expression).expression;
    
    return {
      kind: getStubMethodKind(method.getText()),
      fileName: ref.fileName,
      node: call,
      target: target.getText(),
      typeArguments: call.typeArguments.map((arg) => checker.getTypeAtLocation(arg)),
      arguments: call.arguments.map((arg) => arg.getText())
    };
    
  }
 
}