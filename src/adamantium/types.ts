export interface Binding {
  key: string
  component: string
}

export interface Component {
  key: string
  factory: Function
  dependencies: Dependency[]
}

export interface Dependency {
  key: string
}