export type ComponentMetadataMap = { [type: string]: ComponentMetadata };

export interface Binding {
  service: string
  component: string
}

export interface ComponentMetadata {
  type: string
  dependencies: DependencyMetadata[]
  typeParams?: string[]
}

export interface DependencyMetadata {
  type: string
}
