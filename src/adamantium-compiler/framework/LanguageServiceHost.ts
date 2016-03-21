import * as ts from 'typescript';
let {sys} = ts;

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
      sys.write(`Updated ${fileName} to version ${file.version}` + sys.newLine);
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
    return sys.getCurrentDirectory();
  }
  
  getDefaultLibFileName(options: ts.CompilerOptions) {
    return ts.getDefaultLibFilePath(options);
  }
  
  getScriptInfo(fileName: string): ScriptInfo {
    let info = this.files[fileName];
    if (!info) {
      this.files[fileName] = info = {
        text: sys.readFile(fileName),
        version: 1
      };
      sys.write(`Loaded ${fileName}` + sys.newLine);
    }
    return info;
  }
  
}
