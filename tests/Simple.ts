import {Forge} from '../src/adamantium/Forge';
import {IWeapon} from './types/IWeapon';
import {Katana} from './types/Katana';
import {Ninja} from './types/Ninja';

var forge = new Forge();
forge.bind<IWeapon, Katana>();
let ninja = forge.get<Ninja>();
console.log(ninja.attack('the enemy'));

