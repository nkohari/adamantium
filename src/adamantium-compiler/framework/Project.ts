import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as ts from 'typescript';
import StringSymbolWriter from './StringSymbolWriter';
import LanguageServiceHost from './LanguageServiceHost';

export interface Project {
  emit: () => void
  createSymbolWriter: () => StringSymbolWriter,
  findReferencesForNode: (node: ts.Node) => ts.ReferenceEntry[],
  findTypeDeclaration: (name: string) => ts.ClassDeclaration | ts.InterfaceDeclaration
  getDefinition: (node: ts.Node) => ts.Identifier
  getKeyForType: (type: ts.Type) => string
  getNodeAtPosition: (fileName: string, pos: number) => ts.Node,
  getProgram: () => ts.Program,
  getSourceFile: (fileName: string) => ts.SourceFile,
  getSourceFileForNode: (node: ts.Node) => ts.SourceFile,
  getTypeChecker: () => ts.TypeChecker
  updateSourceFile: (sourceFile: ts.SourceFile, newSource: string, range: ts.TextChangeRange) => void
}

export default Project;

export interface ProjectEmitResult {
  success: boolean,
  errors: ts.Diagnostic[]
}

export function createProject(
  rootFiles: string[],
  options: ts.CompilerOptions = ts.getDefaultCompilerOptions()): Project {

  let languageServiceHost = new LanguageServiceHost(rootFiles, options);
  let languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());
  
  return {
    emit,
    createSymbolWriter,
    findReferencesForNode,
    findTypeDeclaration,
    getDefinition,
    getKeyForType,
    getNodeAtPosition,
    getProgram: () => languageService.getProgram(),
    getSourceFile,
    getSourceFileForNode,
    getTypeChecker,
    updateSourceFile
  };
  
  function createSymbolWriter(): StringSymbolWriter {
    return new StringSymbolWriter();
  }
  
  function getDefinition(node: ts.Node): ts.Identifier {
    const defs = languageService.getDefinitionAtPosition(node.getSourceFile().fileName, node.getStart());
    return defs && <ts.Identifier> getNodeAtPosition(defs[0].fileName, defs[0].textSpan.start);
  }
  
  function getKeyForType(type: ts.Type): string {
    return getTypeChecker().getFullyQualifiedName(type.symbol);
  }
  
  function getSourceFile(fileName: string): ts.SourceFile {
    return languageService.getProgram().getSourceFile(fileName);
  }
  
  function getSourceFileForNode(node: ts.Node): ts.SourceFile {
    return getSourceFile(node.getSourceFile().fileName);
  }
  
  function getTypeChecker() {
    return languageService.getProgram().getTypeChecker();
  }
  
  function getNodeAtPosition(fileName: string, position: number): ts.Node {
    const sourceFile = getSourceFile(fileName);
    let lastMatchingNode: ts.Node = undefined;
    
    let visit = (node: ts.Node) => {
      if (node.getStart() <= position && node.getEnd() >= position) {
        lastMatchingNode = node;
      }
      ts.forEachChild(node, visit);
    }
    
    ts.forEachChild(sourceFile, visit);
    return lastMatchingNode;
  }
  
  function findReferencesForNode(node: ts.Node): ts.ReferenceEntry[] {
    const refs = [];
    const fileName = node.getSourceFile().fileName;
    const symbols = languageService.findReferences(fileName, node.getStart());
    
    if (symbols) {
      for (const symbol of symbols) {
        for (const reference of symbol.references.filter((r) => r.fileName != fileName)) {
          refs.push(reference);
        }
      }
    }
    
    return refs;
  }
  
  function findTypeDeclaration(name: string) {
    let foundNode: ts.ClassDeclaration | ts.InterfaceDeclaration = undefined;
    
    let visit = (node: ts.Node) => {
      if (node.kind == ts.SyntaxKind.ClassDeclaration || node.kind == ts.SyntaxKind.InterfaceDeclaration) {
        let decl = <ts.ClassDeclaration | ts.InterfaceDeclaration> node;
        if (decl.name.text == name) foundNode = decl;
      }
      if (!foundNode) ts.forEachChild(node, visit);
    };
    
    for (const sourceFile of languageService.getProgram().getSourceFiles()) {
      if (!foundNode) ts.forEachChild(sourceFile, visit);
    }
    
    return foundNode;
  }
  
  function updateSourceFile(sourceFile: ts.SourceFile, newSource: string, range: ts.TextChangeRange) {
    const {fileName} = sourceFile;
    languageServiceHost.updateScript(fileName, newSource);
    ts.updateLanguageServiceSourceFile(
      sourceFile,
      languageServiceHost.getScriptSnapshot(fileName),
      languageServiceHost.getScriptVersion(fileName),
      range);
  }
  
  function emit(): ProjectEmitResult {
    const program = languageService.getProgram();
    let errors = [];
    
    for (const sourceFile of program.getSourceFiles()) {
      const output = languageService.getEmitOutput(sourceFile.fileName);
      for (const outputFile of output.outputFiles) {
        mkdirp.sync(path.dirname(outputFile.name));
        fs.writeFileSync(outputFile.name, outputFile.text, 'utf8' /* TODO: charset? */);
      }
    }
    
    return {
      success: errors.length == 0,
      errors: errors
    }
  }
  
}