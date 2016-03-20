import {IWeapon} from './IWeapon';

export class Katana implements IWeapon {
  hit(enemy: string) {
    return `Slices the ${enemy}`;
  }
}