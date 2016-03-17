import * as ts from 'typescript'
import {Project, Analysis} from './types';

interface StubMethodCall {
  fileName: string
  name: string
  node: ts.CallExpression
  lhs:  ts.LeftHandSideExpression
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
      
      const injectSource = generateReplacementCode(call);
      const source = sourceFile.getText();
      const newSource = source.substr(0, startPos) + injectSource + source.substr(endPos);
      
      const span = ts.createTextSpanFromBounds(startPos, endPos);
      const range = ts.createTextChangeRange(span, injectSource.length);
      
      project.updateSourceFile(sourceFile, newSource, range);
    }
  }
  
  function generateReplacementCode(call: StubMethodCall): string {
    console.log(call.lhs);
    // TODO: Won't always be "this"
    let method = `this.${StubMethodTable[call.name]}`;
    let args = call.args.map((arg) => `'${arg}'`).join(', ');
    return `${method}(${args})`
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
            const file = project.getSourceFile(ref.fileName);
            const node = project.findNodeAtPosition(file.fileName, ref.textSpan.start);
            console.log(ref);
          }
        }
      }
    }
    
    /*
    const visit = (node) => {
      if (node.kind == ts.SyntaxKind.CallExpression) {
        const call = <ts.CallExpression> node;
        if (call.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
          const lhs  = <ts.PropertyAccessExpression> call.expression;
          const name = lhs.name.text;
          if (Object.keys(StubMethodTable).indexOf(name) >= 0) {
            calls.push(createStubMethodCall(call, lhs));
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    
    ts.forEachChild(decl, visit);
    */
    
    return calls;
  }
  
  function createStubMethodCall(node: ts.CallExpression, lhs: ts.LeftHandSideExpression) {
    
    let args = node.typeArguments
      .map((arg) => checker.getSymbolAtLocation((<ts.TypeReferenceNode> arg).typeName).getName())
      .concat(node.arguments.map((arg) => arg.getText()))
      
    return {
      name,
      node,
      lhs,
      args,
      fileName: node.getSourceFile().fileName
    };
    
  }
  
}