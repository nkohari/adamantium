import * as ts from 'typescript';
import * as fs from 'fs';

interface ScriptInfo {
  text: string
  version: number
}

export class LanguageServiceHost implements ts.LanguageServiceHost {
  
  files: { [name: string]: ScriptInfo } = {};
  
  constructor(protected rootFileNames: string[], protected options: ts.CompilerOptions) {
    for (const fileName of rootFileNames) {
      this.getScriptInfo(fileName);
    }
  }
  
  updateScript(fileName: string, newText: string) {
    let file = this.files[fileName];
    if (!file) {
      throw new Error(`Tried to update file ${fileName} that we don't know about`);
    }
    else {
      file.text = newText;
      file.version++;
      console.log(`Updated ${fileName} to version ${file.version}`);
    }
  }
  
  getCompilationSettings() {
    return this.options;
  }
  
  getScriptFileNames() {
    return Object.keys(this.files);
  }
  
  getScriptVersion(fileName: string) {
    let info = this.getScriptInfo(fileName);
    return info.version.toString();
  }
  
  getScriptSnapshot(fileName: string) {
    let info = this.getScriptInfo(fileName);
    return ts.ScriptSnapshot.fromString(info.text);
  }
  
  getCurrentDirectory() {
    return process.cwd();
  }
  
  getDefaultLibFileName(options: ts.CompilerOptions) {
    return ts.getDefaultLibFilePath(options);
  }
  
  getScriptInfo(fileName: string): ScriptInfo {
    let info = this.files[fileName];
    if (!info) {
      this.files[fileName] = info = {
        text: fs.readFileSync(fileName).toString(),
        version: 1
      };
      console.log(`Loaded ${fileName}`)
    }
    return info;
  }
  
}
