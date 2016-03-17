import * as ts from 'typescript'
import {Project, Analysis} from './types';

export default function injectDependencyMap(project: Project, analysis: Analysis): void {
  
  const host = project.getLanguageServiceHost();
  const languageService = project.getLanguageService();
  const checker = project.getTypeChecker();
  
  for (const forge of analysis.forges) {
    const {type, fileName} = forge;
    const sourceFile = languageService.getSourceFile(fileName);

    const body = type.symbol.valueDeclaration;
    const payload = JSON.stringify(analysis.components);
    const injectPos = body.getChildAt(body.getChildCount() - 1).pos;
    const injectSource = `\ncomponents = ${payload};`;
    
    const source = sourceFile.getText();
    const newSource = source.substr(0, injectPos) + injectSource + source.substr(injectPos, source.length);
    
    const span = ts.createTextSpan(injectPos, 0);
    const range = ts.createTextChangeRange(span, injectSource.length);
    
    project.updateSourceFile(sourceFile, newSource, range);
  }
  
}