import * as ts from 'typescript';
import {Project, Plan, Container, MagicMethodCall, MagicMethodKind} from '../framework';

interface SourceChange {
  newSource: string
  range: ts.TextChangeRange
}

export default function augmentSource(project: Project, plan: Plan): void {
  
  const checker = project.getTypeChecker();
  const builder = checker.getSymbolDisplayBuilder();
  
  for (const container of plan.getContainers()) {
    rewriteCalls(container);
    addComponentRegistrations(container);
  }
  
  function rewriteCalls(container: Container) {
    for (const call of container.getCalls()) {
      let newMethod: string;
      
      switch (call.kind) {
        case MagicMethodKind.Get:
          newMethod = 'resolve';
          break;
        case MagicMethodKind.GetAll:
          newMethod = 'resolveAll';
          break;
        case MagicMethodKind.Bind:
          newMethod = 'addBinding';
          break;
      }
      
      const typeArgs = call.typeArguments.map((arg) => `'${project.getKeyForType(arg)}'`);
      const newText = `${call.targetName}.${newMethod}(${typeArgs.concat(call.arguments).join(', ')})`;
      replaceNode(call.node, newText);
    }
  }

  
  function addComponentRegistrations(container: Container) {
    
    // TODO: This is a very naive implementation. We'll need to add imports as well.
    const statements = container.getComponents().map((component) => {
      const type = component.factory.getReturnType();
      const ctor = checker.symbolToString(type.symbol); 
      const deps = component.dependencies.map((dep) => `'${dep}'`).join(', ');
      const str = `${container.name}.addComponent('${component.key}', ${ctor}, [${deps}]);`
      return str; 
    });
    
    insertSourceAfter(container.declaration, '\n' + statements.join('\n'));
    
  }
  
  function replaceNode(node: ts.Node, newText: string) {
    const sourceFile = project.getSourceFileForNode(node);
  
    const startPos = node.getStart();
    const endPos = node.getEnd();
    const source = sourceFile.getText();
    const newSource = source.substr(0, startPos) + newText + source.substr(endPos);
    
    const span = ts.createTextSpanFromBounds(startPos, endPos);
    const range = ts.createTextChangeRange(span, newText.length);
    
    project.updateSourceFile(sourceFile, newSource, range);
  }
  
  function insertSourceAfter(node: ts.Node, text: string) {
    const sourceFile = project.getSourceFileForNode(node);
    
    const pos = node.getEnd() + 1;
    const source = sourceFile.getText();
    const newSource = source.substr(0, pos) + text + source.substr(pos);

    const span = ts.createTextSpan(pos, 0);
    const range = ts.createTextChangeRange(span, text.length);
    
    project.updateSourceFile(sourceFile, newSource, range);
  }
 
}
