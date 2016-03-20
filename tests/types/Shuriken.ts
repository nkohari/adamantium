import {IWeapon} from './IWeapon';

export class Shuriken implements IWeapon {
  hit(enemy: string) {
    return `Pierces the ${enemy}`;
  }
}
