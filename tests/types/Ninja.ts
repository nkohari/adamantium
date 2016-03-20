import {IWeapon} from './IWeapon';

export class Ninja {
  
  weapon: IWeapon
  
  constructor(weapon: IWeapon) {
    this.weapon = weapon;
  }
  
  attack(enemy: string) {
    return this.weapon.hit(enemy);
  }
  
}
