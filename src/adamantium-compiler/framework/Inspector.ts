import * as ts from 'typescript';
import Component from './Component';
import Container from './Container';
import Plan from './Plan';
import Project from './Project';
import MagicMethodCall, {MagicMethodKind} from './MagicMethodCall';

interface Inspector {
  inspectCall: (call: MagicMethodCall) => any
  inspectContainer: (container: Container) => any
  inspectNode: (node: ts.Node) => any
  inspectPlan: (plan: Plan) => any
}

export default Inspector;

export function createInspector(project: Project): Inspector {
  
  const checker = project.getTypeChecker();
  
  return {
    inspectCall,
    inspectContainer,
    inspectNode,
    inspectPlan
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
  
  function inspectComponent(component: Component): any {
    return {
      key: component.key,
      factory: component.factory.getReturnType().symbol.name,
      args: component.dependencies
    }
  }
  
  function inspectContainer(container: Container): any {
    return {
      id: container.id,
      node: inspectNode(container.node),
      //bindings: container.getBindings().map(inspectBinding),
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