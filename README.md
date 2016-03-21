![Adamantium](https://github.com/nkohari/adamantium/raw/master/docs/adamantium.png)

**NOTE: This is experimental. Do not attempt to use it in a production system.**

This is an experiement in creating a compile-time dependency resolution system. By leveraging
the TypeScript compiler API, we can generate a minimal dependency graph for a codebase using
static analysis. This has the following benefits:

1. We can prove that a dependency graph is complete at compile time, and report missing
   components as compiler errors.
2. We don't need to rely on "magic strings" or decorator metadata to do component resolution.

Adamantium exposes a simple type-safe container API, fashioned after [Ninject](http://ninject.org/):

```ts
let forge = new Forge();
forge.bind<IWeapon, Katana>();
let ninja = forge.get<Ninja>();
```

Using a custom compiler, Adamantium transforms this code at compile-time to a complete
dependency graph, by doing the same analysis that Ninject does at run-time. Since JavaScript
has no run-time type information (RTTI), Adamantium rewrites the strong-typed calls to
weak-typed equivalents, and by walking the dependency graph, determines all possible
component resolutions and the dependencies they would require.

The rewritten source looks something like this:

```js
let forge = new Forge();
forge.addComponent('Ninja#2', Ninja, [{ key: 'IWeapon#1' }]);
forge.addComponent('Katana#3', Katana, []);
forge.addBinding('Ninja#2', 'Ninja#2');
forge.addBinding('Katana#3', 'Katana#3');
forge.addBinding('IWeapon#1', 'Katana#3');
var ninja = forge.resolve('Ninja#2');
```

As a result, Adamantium takes a similar approach to TypeScript: it lets you take advantage
of a powerful type system at compile-time, and outputs normal JavaScript. Since it doesn't
need to do any further analysis, the resulting container is extremely fast, and guaranteed
to be correct.
