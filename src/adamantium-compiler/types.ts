import * as ts from 'typescript';
import {ComponentMetadataMap} from '../adamantium/types';
import {LanguageServiceHost} from './languageServiceHost';

export interface Project {
  emit: () => void
  findNodeAtPosition: (fileName: string, pos: number) => ts.Node,
  findReferencesForNode: (node: ts.Node) => ts.ReferenceEntry[],
  findTypeDeclaration: (name: string) => ts.ClassDeclaration | ts.InterfaceDeclaration
  getLanguageService: () => ts.LanguageService,
  getProgram: () => ts.Program,
  getSourceFile: (fileName: string) => ts.SourceFile,
  getTypeChecker: () => ts.TypeChecker
  updateSourceFile: (sourceFile: ts.SourceFile, newSource: string, range: ts.TextChangeRange) => void
}

export interface ProjectEmitResult {
  success: boolean,
  errors: ts.Diagnostic[]
}

export interface ForgeClassDeclaration {
  type: ts.Type
  fileName: string
}

export interface Analysis {
  forges: ForgeClassDeclaration[]
  components: ComponentMetadataMap 
}
