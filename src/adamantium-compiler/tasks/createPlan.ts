import * as ts from 'typescript';
import {Binding, BindingMap, Plan, Request} from '../framework';
import {Project, StubMethodCall, StubMethodKind} from '../lang';

export default function createPlan(project: Project, calls: StubMethodCall[]): Plan {
  
  const languageService = project.getLanguageService();
  const checker = project.getTypeChecker();
  
  const bindings = new BindingMap();
  const requests: Request[] = [];
  
  for (const call of calls) {
    switch (call.kind) {
      case StubMethodKind.Get:
      case StubMethodKind.GetAll:
        requests.push(new Request(call.typeArguments[0]));
        break;
      case StubMethodKind.Bind:
        const [service, component] = call.typeArguments;
        const key = project.getKeyForType(service);
        bindings.add(new Binding(key, service, component));
        requests.push(new Request(component));
        break;
    }
  }

  while (requests.length > 0) {
    const request = requests.shift();
    const bindings = resolveBindings(request);
    
    for (const binding of bindings) {    
      const target = checker.getTypeOfSymbolAtLocation(binding.component.symbol, binding.component.symbol.valueDeclaration);
      const constructors = target.getConstructSignatures();
      
      if (constructors.length == 0) {
        // TODO: Return as diagnostic?
        throw new Error(`Dependency graph is incomplete, cannot resolve ${target.symbol.getName()}`);
      }
      
      const bestConstructor = selectConstructor(constructors);
      binding.ctor = bestConstructor;
      
      for (const param of bestConstructor.parameters) {
        const type = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration);
        const name = checker.getFullyQualifiedName(type.symbol);
        if (!bindings[name]) {
          requests.push(new Request(type, request.type));
        }
      }
    }
  }
  
  function resolveBindings(request: Request): Binding[] {
    const key = project.getKeyForType(request.type);
    let matches = bindings.get(key);
    
    if (matches.length == 0) {
      const binding = new Binding(key, request.type, request.type);
      bindings.add(binding);
      matches = [binding];
    }
    
    return matches;
  }
  
  function selectConstructor(constructors: ts.Signature[]): ts.Signature {
    return constructors.sort((ctor) => -ctor.parameters.length)[0];
  }
  
  for (const name of Object.keys(bindings)) {
    for (const binding of bindings[name]) {
      console.log(binding);
    }
  }
  
  return new Plan(bindings);
  
}
