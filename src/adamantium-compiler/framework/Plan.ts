import * as ts from 'typescript'
import Container from './Container';
import MagicMethodCall from './MagicMethodCall';

export class Plan {
  
  containers: Container[]
  
  constructor() {
    this.containers = [];
  }
  
  addCall(call: MagicMethodCall) {
    let container = this.getContainer(call.target);
    if (!container) {
      const decl = <ts.VariableDeclaration> call.target.parent;
      container = new Container(this.containers.length + 1, call.targetName, call.target, decl);
      this.containers.push(container);
    }
    container.addCall(call);
  }
  
  getContainers(): Container[] {
    return this.containers;
  }
  
  getContainer(node: ts.Identifier): Container {
    for (const container of this.containers) {
      if (container.node == node) return container;
    }
    return undefined;
  }
  
}

export default Plan;
