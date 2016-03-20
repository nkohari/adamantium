import * as ts from 'typescript';

class StringSymbolWriter implements ts.SymbolWriter {
  
  text: string
  
  clear() { this.text = ""; }
  increaseIndent() { }
  decreaseIndent() { }
  string() { return this.text; }
  
  trackSymbol() { }
  reportInaccessibleThisError() { }
  writeText(str: string) { this.text += str; }
  writeKeyword(str: string) { this.writeText(str); }
  writeOperator(str: string) { this.writeText(str); }
  writePunctuation(str: string) { this.writeText(str); }
  writeSpace(str: string) { this.writeText(str); }
  writeStringLiteral(str: string) { this.writeText(str); }
  writeParameter(str: string) { this.writeText(str); }
  writeSymbol(str: string) { this.writeText(str); }
  writeLine() { this.text += " "; }
  
}

export default StringSymbolWriter;
