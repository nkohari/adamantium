import * as ts from 'typescript';
import {LanguageServiceHost} from './languageServiceHost';

export interface Project {
  getLanguageServiceHost: () => LanguageServiceHost,
  getLanguageService: () => ts.LanguageService,
  getProgram: () => ts.Program,
  getTypeChecker: () => ts.TypeChecker
  emit: () => void
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

export interface ForgeClass {
  type: ts.Type
  sourceFile: ts.SourceFile
}

export interface Analysis {
  forges: ForgeClass[]
  components: { [type: string]: Component } 
}
