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
    updateSourceFile,
    getLanguageServiceHost: () => languageServiceHost,
    getLanguageService: () => languageService,
    getProgram: () => languageService.getProgram(),
    getTypeChecker: () => languageService.getProgram().getTypeChecker()
  };
  
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