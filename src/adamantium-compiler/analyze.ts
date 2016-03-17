import * as ts from 'typescript';
import {Project, Analysis, ForgeClassDeclaration} from './types';
import {ComponentMetadata, DependencyMetadata} from '../adamantium/types';

export default function analyze(project: Project): Analysis {
  
  const program = project.getProgram();
  const checker = project.getTypeChecker();

  const analysis: Analysis = {
    forges: [],
    components: {}
  };
  
  for (const sourceFile of program.getSourceFiles()) {
    ts.forEachChild(sourceFile, (node) => visit(node, sourceFile));
  }
  
  return analysis;
  
  function visit(node: ts.Node, sourceFile: ts.SourceFile) {
    if (node.kind == ts.SyntaxKind.ClassDeclaration) {
      const symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);
      const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
      if (isForge(type) && (node.flags & ts.NodeFlags.Abstract) == 0) {
        addForge(node, type, sourceFile);
      }
      else {
        addComponent(type);
      }
    }
    else if (node.kind == ts.SyntaxKind.ModuleDeclaration) {
      ts.forEachChild(node, (child) => visit(child, sourceFile));
    }
  }
  
  function addForge(node: ts.Node, type: ts.Type, sourceFile: ts.SourceFile): void {
    analysis.forges.push({
      type: type,
      fileName: sourceFile.fileName
    });
  }
  
  function addComponent(type: ts.Type): void {
    const ctor = selectConstructor(type.getConstructSignatures());
    const baseTypes = checker.getBaseTypes(<ts.InterfaceType> type);
    const name = checker.getFullyQualifiedName(type.symbol);
    analysis.components[name] = {
      type: name,
      dependencies: ctor.parameters.map(analyzeDependency),
      typeParams: getTypeParameters(ctor)
    };
  }
  
  function analyzeDependency(symbol: ts.Symbol) : DependencyMetadata {
    let type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    return {
      type: checker.typeToString(type)
    };
  }
  
  function getTypeParameters(ctor: ts.Signature): string[] {
    if (ctor.typeParameters) {
      return ctor.typeParameters.map((t) => checker.typeToString(t));
    }
    else {
      return undefined;
    }
  }
  
  function selectConstructor(constructors: ts.Signature[]) {
    return constructors.sort((ctor) => -ctor.parameters.length)[0];
  }
  
  function isForge(type: ts.Type): boolean {
    return type.getProperty('_adamantium') !== undefined;
  }
  
}
