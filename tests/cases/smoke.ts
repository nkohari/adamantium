import Forge from '../../src/adamantium/Forge';

interface IWeapon {
  hit: (string) => string
}

class Shuriken implements IWeapon {
  hit(enemy: string) {
    return `Pierces the ${enemy}`;
  }
}

class Katana implements IWeapon {
  hit(enemy: string) {
    return `Slices the ${enemy}`;
  }
}

class Ninja {
  constructor(public weapon: IWeapon) {
  }
  attack(enemy: string) {
    return this.weapon.hit(enemy);
  }
}

var forge = new Forge();
forge.bind<IWeapon, Katana>();

let ninja = forge.get<Ninja>();
