import * as ts from 'typescript';
import {Project} from '../framework';
import {Plan, Binding, Component, Container, Dependency, MagicMethodKind, Request} from '../model';

export default function resolveDependencyGraph(project: Project, plan: Plan): void {
  
  const checker = project.getTypeChecker();
  
  for (const container of plan.getContainers()) {
    resolveBindingsForContainer(container);
  }
  
  function resolveBindingsForContainer(container: Container) {
    const requests: Request[] = [];
    
    for (const call of container.getCalls()) {
      switch (call.kind) {
        case MagicMethodKind.Get:
        case MagicMethodKind.GetAll:
          requests.push(new Request(call.typeArguments[0]));
          break;
        case MagicMethodKind.Bind:
          const [from, to] = call.typeArguments;
          const key = project.getKeyForType(from);
          container.addBinding(Binding.declared(key, from, to));
          requests.push(new Request(to));
          break;
      }
    }
    
    while (requests.length > 0) {
      const request = requests.shift();
      const matches = resolveBindingsForRequest(container, request);
      
      for (const binding of matches) {
        const {symbol} = binding.to;
        const target = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        const constructors = target.getConstructSignatures();
        
        if (constructors.length == 0) {
          // TODO: Return as diagnostic?
          throw new Error(`Dependency graph is incomplete, cannot resolve ${target.symbol.name}`);
        }
        
        const bestConstructor = selectConstructor(constructors);
        const dependencies: Dependency[] = [];
        
        for (const param of bestConstructor.parameters) {
          const type = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration);
          const key  = project.getKeyForType(type);
          dependencies.push(new Dependency(key));
          if (!container.hasBindings(key)) {
            requests.push(new Request(type, request.type));
          }
        }
        
        container.addComponent(new Component(binding.key, bestConstructor, dependencies))
      }
    }
  }

  function resolveBindingsForRequest(container: Container, request: Request): Binding[] {
    const key = project.getKeyForType(request.type);
    let matches = container.getBindings(key);
    
    if (matches.length == 0) {
      const binding = Binding.implicit(key, request.type, request.type);
      container.addBinding(binding);
      matches = [binding];
    }
    
    return matches;
  }
  
  function selectConstructor(constructors: ts.Signature[]): ts.Signature {
    return constructors.sort((ctor) => -ctor.parameters.length)[0];
  }

}
