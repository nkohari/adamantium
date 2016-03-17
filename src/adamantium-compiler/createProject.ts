import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as ts from 'typescript';
import {Project, ProjectEmitResult} from './types';
import {LanguageServiceHost} from './languageServiceHost';

export default function createProject(
  rootFiles: string[],
  options: ts.CompilerOptions = ts.getDefaultCompilerOptions()): Project {

  let languageServiceHost = new LanguageServiceHost(rootFiles, options);
  let languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

  return {
    emit,
    findNodeAtPosition,
    findReferencesForNode,
    findTypeDeclaration,
    getLanguageService: () => languageService,
    getProgram: () => languageService.getProgram(),
    getSourceFile: (fileName: string) => languageService.getSourceFile(fileName),
    getTypeChecker: () => languageService.getProgram().getTypeChecker(),
    updateSourceFile
  };
  
  function findNodeAtPosition(fileName: string, pos: number): ts.Node {
    const sourceFile = languageService.getSourceFile(fileName);
    let foundNode: ts.Node = undefined;
    
    let visit = (node: ts.Node) => {
      if (node.getStart() <= pos && node.getEnd() >= pos) {
        foundNode = node;
      }
      if (!foundNode) ts.forEachChild(node, visit);
    }
    
    ts.forEachChild(sourceFile, visit);
    return foundNode;
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