import * as ts from 'typescript';
import {Project, Plan, BindingKind, Container, MagicMethodCall, MagicMethodKind} from '../framework';

interface SourceChange {
  newSource: string
  range: ts.TextChangeRange
}

export default function augmentSource(project: Project, plan: Plan): void {
  
  const checker = project.getTypeChecker();
  const builder = checker.getSymbolDisplayBuilder();
  
  for (const container of plan.getContainers()) {
    rewriteCalls(container);
    addImplicitBindings(container);
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
  
  function addImplicitBindings(container: Container) {
    const statements = container.getBindings()
    .filter((b) => b.kind == BindingKind.Implicit)
    .map((binding) => {
      const target = project.getKeyForType(binding.to);
      return `${container.name}.addBinding('${binding.key}', '${target}');`;
    });
    insertSourceAfter(container.declaration, '\n' + statements.join('\n'));
  }
  
  function addComponentRegistrations(container: Container) {
    // TODO: Do we need to draw in imports to be able to correctly reference the constructors?
    const statements = container.getComponents().map((component) => {
      const type = component.factory.getReturnType();
      const ctor = checker.symbolToString(type.symbol);
      const deps = component.dependencies.map((dep) => `{key: '${dep.key}'}`);
      const str = `${container.name}.addComponent('${component.key}', ${ctor}, [${deps.join(', ')}]);`
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
    
    console.log('-----------------------');
    console.log(newSource);
    project.updateSourceFile(sourceFile, newSource, range);
  }
  
  function insertSourceAfter(node: ts.Node, text: string) {
    const sourceFile = project.getSourceFileForNode(node);
    
    const pos = node.getFullStart() + node.getFullWidth() + 1;
    const source = sourceFile.getFullText();
    const newSource = source.substr(0, pos) + text + source.substr(pos);

    const span = ts.createTextSpan(pos, 0);
    const range = ts.createTextChangeRange(span, text.length);
    
    console.log('-----------------------');
    console.log(newSource);
    project.updateSourceFile(sourceFile, newSource, range);
  }
 
}
