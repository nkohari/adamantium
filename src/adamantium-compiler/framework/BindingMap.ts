import Binding from './Binding';

class BindingMap {
  
  entries: { [service: string]: Binding[] };
  
  constructor() {
    this.entries = {};
  }
  
  add(binding: Binding) {
    let list = this.entries[binding.key];
    if (!list) {
      list = this.entries[binding.key] = [];
    }
    list.push(binding);
  }
  
  get(key: string): Binding[] {
    return this.entries[key] || [];
  }
  
}

export default BindingMap;
