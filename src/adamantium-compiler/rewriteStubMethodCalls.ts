import * as ts from 'typescript'
import {Project, Analysis} from './types';

interface StubMethodCall {
  fileName: string
  method: string
  node: ts.CallExpression
  target: string
  args: string[]
}

const StubMethodTable = {
  'bind':   'weakBind',
  'get':    'weakGet',
  'getAll': 'weakGetAll'
};

export default function rewriteStubMethodCalls(project: Project, analysis: Analysis): void {
  
  const languageService = project.getLanguageService();
  const checker = project.getTypeChecker();
  
  for (const forge of analysis.forges) {
    const {type, fileName} = forge;
    
    for (const call of findStubMethodCalls()) {
      const sourceFile = project.getSourceFile(call.fileName);
    
      const startPos = call.node.getStart();
      const endPos = call.node.getEnd();
      
      const injectSource = `${call.target}.${StubMethodTable[call.method]}(${call.args.join(', ')})`
      const source = sourceFile.getText();
      const newSource = source.substr(0, startPos) + injectSource + source.substr(endPos);
      
      const span = ts.createTextSpanFromBounds(startPos, endPos);
      const range = ts.createTextChangeRange(span, injectSource.length);
      
      project.updateSourceFile(sourceFile, newSource, range);
    }
  }
  
  function findStubMethodCalls(): StubMethodCall[] {
    const calls = [];

    // TODO: Should look up by position in the (known) Forge.ts file instead of by name.
    const typeDecl = <ts.ClassDeclaration> project.findTypeDeclaration('Forge');
    const {fileName} = typeDecl.getSourceFile();
    
    for (const member of typeDecl.members) {
      if (member.kind == ts.SyntaxKind.MethodDeclaration) {
        const decl = <ts.MethodDeclaration> member;
        const name = checker.getSymbolAtLocation(decl.name).getName();
        if (StubMethodTable[name]) {
          for (const ref of project.findReferencesForNode(decl)) {
            calls.push(createStubMethodCall(ref));
          }
        }
      }
    }
    
    return calls;
  }
  
  function createStubMethodCall(ref: ts.ReferenceEntry): StubMethodCall {
    
    const method = <ts.Identifier> project.getNodeAtPosition(ref.fileName, ref.textSpan.start);
    const call   = <ts.CallExpression> method.parent.parent;
    const target = (<ts.PropertyAccessExpression> call.expression).expression;
    
    let resolveType = (arg: ts.TypeNode): string => {
      const symbol = checker.getSymbolAtLocation(arg);
      if (symbol) {
        return checker.getFullyQualifiedName(symbol);
      }
      else {
        // TODO: It seems like for some types (interfaces?) the checker won't
        // resolve a symbol. Falling back on the text is a bad idea.
        return arg.getText();
      }
    };
    
    const typeArguments = call.typeArguments.map((arg) => `'${resolveType(arg)}'`)
    const regularArguments = call.arguments.map((arg) => arg.getText());
    
    return {
      fileName: ref.fileName,
      node: call,
      method: method.getText(),
      target: target.getText(),
      args: typeArguments.concat(regularArguments)
    };
    
  }
  
}