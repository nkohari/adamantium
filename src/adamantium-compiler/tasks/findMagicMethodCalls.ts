import * as ts from 'typescript';
import {Project, Plan, MagicMethodCall, MagicMethodKind} from '../framework';

const MagicMethods = {
  'bind':   MagicMethodKind.Bind,
  'get':    MagicMethodKind.Get,
  'getAll': MagicMethodKind.GetAll
}

export default function findMagicMethodCalls(project: Project, plan: Plan): void {
  
  const checker = project.getTypeChecker();
  
  // TODO: Should look up by position in the (known) Forge.ts file instead of by name.
  // This is prone to failure if the project contains another type called Forge.
  const typeDecl = <ts.ClassDeclaration> project.findTypeDeclaration('Forge');
  
  for (const member of typeDecl.members) {
    if (member.kind == ts.SyntaxKind.MethodDeclaration) {
      const decl = <ts.MethodDeclaration> member;
      const kind = getMagicMethodKind(decl);
      if (kind !== undefined) {
        for (const ref of project.findReferencesForNode(decl)) {
          plan.addCall(createMethodCall(kind, ref));
        }
      }
    }
  }
  
  function createMethodCall(kind: MagicMethodKind, ref: ts.ReferenceEntry): MagicMethodCall {
    
    const method = <ts.Identifier> project.getNodeAtPosition(ref.fileName, ref.textSpan.start);
    const call   = <ts.CallExpression> method.parent.parent;
    const target = (<ts.PropertyAccessExpression> call.expression).expression;
    
    return {
      kind,
      fileName: ref.fileName,
      node: call,
      target: project.getDefinition(target),
      targetName: target.getText(),
      typeArguments: call.typeArguments.map((arg) => checker.getTypeAtLocation(arg)),
      arguments: call.arguments.map((arg) => arg.getText())
    };
    
  }
 
  function getMagicMethodKind(decl: ts.MethodDeclaration): MagicMethodKind {
    const symbol = checker.getSymbolAtLocation(decl.name);
    return MagicMethods[symbol.getName()] || undefined;
  }
  
}