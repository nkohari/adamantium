import * as ts from 'typescript';
import {LanguageServiceHost} from './languageServiceHost';

export interface Project {
  getLanguageServiceHost: () => LanguageServiceHost,
  getLanguageService: () => ts.LanguageService,
  getProgram: () => ts.Program,
  getTypeChecker: () => ts.TypeChecker
  emit: () => void
  updateSourceFile: (sourceFile: ts.SourceFile, newSource: string, range: ts.TextChangeRange) => void
}

export interface ProjectEmitResult {
  success: boolean,
  errors: ts.Diagnostic[]
}

export interface Component {
  type?: string
  dependencies?: Dependency[]
  typeParams?: string[]
}

export interface Dependency {
  type?: string
}

export interface Binding {
  node: ts.Node
  service: string
  component: string
}

export interface ForgeClass {
  type: ts.Type
  fileName: string
}

export interface Analysis {
  forges: ForgeClass[]
  components: { [type: string]: Component } 
}
