import * as ts from 'typescript'
import {Project, Binding, Analysis} from './types';

export default function alterBindingStatements(project: Project, analysis: Analysis): void {
  
  const host = project.getLanguageServiceHost();
  const languageService = project.getLanguageService();
  const checker = project.getTypeChecker();
  
  for (const forge of analysis.forges) {
    const {type, fileName} = forge;
    const sourceFile = languageService.getSourceFile(fileName);
    
    let bindings = findBindingStatementsWithin(type.symbol.valueDeclaration);
    
    for (const binding of bindings) {
      const startPos = binding.node.getStart();
      const endPos = binding.node.getEnd();
      
      const injectSource = `this._bind('${binding.service}', '${binding.component}')`
      const source = sourceFile.getText();
      const newSource = source.substr(0, startPos) + injectSource + source.substr(endPos);
      
      const span = ts.createTextSpanFromBounds(startPos, endPos);
      const range = ts.createTextChangeRange(span, injectSource.length);
      
      project.updateSourceFile(sourceFile, newSource, range);
    }
  }
  
  function findBindingStatementsWithin(decl: ts.Node): Binding[] {
    let bindings = [];
    
    let visit = (node) => {
      if (node.kind == ts.SyntaxKind.CallExpression) {
        let call = <ts.CallExpression> node;
        if (call.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
          let expr = <ts.PropertyAccessExpression> call.expression;
          if (expr.name.text == 'bind') {
            bindings.push(createBinding(node, call.typeArguments));
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    
    ts.forEachChild(decl, visit);
    return bindings;
  }
  
  function createBinding(node: ts.Node, typeArguments: ts.NodeArray<ts.TypeNode>): Binding {
    return {
      node: node,
      service: resolveTypeReference(<ts.TypeReferenceNode> typeArguments[0]),
      component: resolveTypeReference(<ts.TypeReferenceNode> typeArguments[1])
    }
  }
  
  function resolveTypeReference(node: ts.TypeReferenceNode): string {
    const symbol = checker.getSymbolAtLocation(node.typeName);
    return symbol.getName();
  }
  
}