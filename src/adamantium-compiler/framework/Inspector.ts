import * as ts from 'typescript';
import {Project} from './';
import {Binding, BindingKind, Component, Container, Dependency, Plan, MagicMethodCall, MagicMethodKind} from '../model';

export interface Inspector {
  inspectBinding: (binding: Binding) => any
  inspectCall: (call: MagicMethodCall) => any
  inspectContainer: (container: Container) => any
  inspectDependency: (dependency: Dependency) => any
  inspectNode: (node: ts.Node) => any
  inspectPlan: (plan: Plan) => any
}

export function createInspector(project: Project): Inspector {
  
  const checker = project.getTypeChecker();
  
  return {
    inspectBinding,
    inspectCall,
    inspectContainer,
    inspectDependency,
    inspectNode,
    inspectPlan
  }
  
  function inspectBinding(binding: Binding): any {
    return {
      key:  binding.key,
      kind: (binding.kind == BindingKind.Declared ? 'declared' : 'implicit'),
      from: project.getKeyForType(binding.from),
      to:   project.getKeyForType(binding.to)
    }
  }
  
  function inspectCall(call: MagicMethodCall): any {
    switch (call.kind) {
      case MagicMethodKind.Get:
        return {kind: 'get', service: call.typeArguments[0].symbol.name}
      case MagicMethodKind.GetAll:
        return {kind: 'getAll', service: call.typeArguments[0].symbol.name}
      case MagicMethodKind.Bind:
        const [service, component] = call.typeArguments;
        return {kind: 'bind', service: service.symbol.name, component: component.symbol.name} 
    }
  }
  
  function inspectDependency(dependency: Dependency): any {
    return {
      key: dependency.key
    }
  }
  
  function inspectComponent(component: Component): any {
    return {
      key: component.key,
      factory: component.factory.getReturnType().symbol.name,
      args: component.dependencies.map(inspectDependency)
    }
  }
  
  function inspectContainer(container: Container): any {
    return {
      id: container.id,
      node: inspectNode(container.node),
      bindings: container.getBindings().map(inspectBinding),
      calls: container.getCalls().map(inspectCall),
      components: container.getComponents().map(inspectComponent),
    }
  }
    
  function inspectNode(node: ts.Node): any {
    let symbol = checker.getSymbolAtLocation(node);
    return {
      name: symbol.name,
      fileName: node.getSourceFile().fileName,
      pos: node.getFullStart()
    };
  }
  
  function inspectPlan(plan: Plan): any {
    return {containers: plan.getContainers().map(inspectContainer)};
  }
  
}