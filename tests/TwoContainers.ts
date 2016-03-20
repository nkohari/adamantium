import {Forge} from '../src/adamantium/Forge';
import {IWeapon} from './types/IWeapon';
import {Katana} from './types/Katana';
import {Shuriken} from './types/Shuriken';
import {Ninja} from './types/Ninja';

var forge1 = new Forge();
var forge2 = new Forge();

forge1.bind<IWeapon, Katana>();
forge2.bind<IWeapon, Shuriken>();

let ninja1 = forge1.get<Ninja>();
console.log(ninja1.attack('the enemy'));

let ninja2 = forge2.get<Ninja>();
console.log(ninja2.attack('the enemy'));
