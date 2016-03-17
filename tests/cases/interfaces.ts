export interface IA {
}

export interface IB {
}

class InterfaceFoo {
  constructor(a: IA) {
  }
}

class InterfaceBar implements IA, IB {
}
