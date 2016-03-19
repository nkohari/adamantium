import * as ts from 'typescript';

class Request {
  
  type: ts.Type
  parent: ts.Type
  
  constructor(type: ts.Type, parent?: ts.Type) {
    this.type = type;
    this.parent = parent;
  }

}

export default Request;
