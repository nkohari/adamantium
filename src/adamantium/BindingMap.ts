import {Binding} from './types';

class BindingMap {
  
  entries: { [service: string]: Binding[] };
  
  constructor() {
    this.entries = {};
  }
  
  add(binding: Binding) {
    let list = this.entries[binding.service];
    if (!list) {
      list = this.entries[binding.service] = [];
    }
    list.push(binding);
  }
  
  get(service: string): Binding[] {
    return this.entries[service];
  }
  
}

export default BindingMap;
