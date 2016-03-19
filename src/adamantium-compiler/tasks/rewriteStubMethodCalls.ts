import * as ts from 'typescript';
import {Project, StubMethodCall, getStubReplacement} from '../lang';

export default function rewriteStubMethodCalls(project: Project, calls: StubMethodCall[]): void {
  
  const checker = project.getTypeChecker();
  
  for (const call of calls) {
    const sourceFile = project.getSourceFile(call.fileName);
  
    const startPos = call.node.getStart();
    const endPos = call.node.getEnd();
    const injectSource = generateReplacementSource(call);
    const source = sourceFile.getText();
    const newSource = source.substr(0, startPos) + injectSource + source.substr(endPos);
    
    const span = ts.createTextSpanFromBounds(startPos, endPos);
    const range = ts.createTextChangeRange(span, injectSource.length);
    
    project.updateSourceFile(sourceFile, newSource, range);
  }
  
  function generateReplacementSource(call: StubMethodCall): string {
    const method = getStubReplacement(call.kind);
    const typeArgs = call.typeArguments.map((arg) => `'${project.getKeyForType(arg)}'`);
    return `${call.target}.${method}(${typeArgs.concat(call.arguments).join(', ')})`;
  }
 
}