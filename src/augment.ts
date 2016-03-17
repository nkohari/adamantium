import * as ts from 'typescript'
import {Project, Analysis, ForgeClass} from './types';

export default function augment(project: Project, analysis: Analysis): void {
  
  const host = project.getLanguageServiceHost();
  const payload = JSON.stringify(analysis.components);
  
  for (const forge of analysis.forges) {
    augment(forge);
  }
  
  function augment(forge: ForgeClass) {
    const {type, sourceFile} = forge;
    const {fileName} = sourceFile;

    let body = type.symbol.valueDeclaration;
    let injectPos = body.getChildAt(body.getChildCount() - 1).pos;
    let injectSource = `\ncomponents = ${payload};`;
    
    let source = sourceFile.getText();
    let newSource = source.substr(0, injectPos) + injectSource + source.substr(injectPos, source.length);
    
    let span = ts.createTextSpan(injectPos, 0);
    let range = ts.createTextChangeRange(span, injectSource.length);
    
    host.updateScript(fileName, newSource);
    ts.updateLanguageServiceSourceFile(sourceFile, host.getScriptSnapshot(fileName), host.getScriptVersion(fileName), range);
  }
  
}