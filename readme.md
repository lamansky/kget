# kget

Uses one or more keys to retrieve a value from a Map, Object, or other collection. Supports nesting, loose key matching, and more.

## Installation

Requires [Node.js](https://nodejs.org/) 8.3.0 or above.

```bash
npm i kget
```

## API

The module exports a function (`get()`) that has other functions attached to it as methods (e.g. `get.any()`).

### `get()`

#### Parameters

1. Bindable: `collection` (Array, iterator, Map, Object, Set, string, Typed Array, or WeakMap): The key-value collection from which to retrieve a value.
2. `keychain` (any, or array of any): A key to retrieve, or an array of nested keys.
3. Optional: Object argument:
    * `arrays` / `maps` / `sets` / `weakMaps` (arrays of classes/strings): Arrays of classes and/or string names of classes that should be treated as equivalent to `Array`/`Map`/`Set`/`WeakMap` (respectively).
    * `elseReturn` (any): A value to return if `keychain` is an invalid reference. Only takes effect if no `elseThrow` is specified. Defaults to `undefined`.
    * `elseThrow` (Error or string): An error to be thrown if `keychain` is an invalid reference. A string will be wrapped in an `Error` object automatically.
    * `get` (function): A callback which, if provided, will override the built-in code that fetches an individual key from a collection. Use this if you need to support collections whose custom APIs preclude the use of parameters like `maps`. The callback will be called with five arguments: the collection, the key, the options object, the fallback to return if the key is not found, and a callback for the built-in get behavior (to which your custom `get` callback can defer if it determines that it doesn’t need to override the default behavior after all).
    * `inObj` (boolean): Whether or not to search inherited properties if `collection` is an Object (i.e. not another recognized type). Defaults to `false`.
    * `loose` (boolean): Whether or not to evaluate keys loosely (as defined by `looselyEquals`). Defaults to `false`.
    * `looselyEquals` (function): A callback that accepts two values and returns `true` if they are to be considered equivalent or `false` otherwise. This argument is only used if `loose` is `true`. If this option is omitted, then the [`equals`](https://www.npmjs.com/package/equals) module is used. This module will, among other things, consider arrays/objects to be equal if they have the same entries.
    * `preferStrict` (boolean): Only applies if `loose` is `true`. If `true`, then strictly-identical keys will be preferred over loosely-equivalent keys. Otherwise, the first loosely-equivalent key found will be used, even if a strictly-identical one comes later. Defaults to `false`.
    * `reverse` (boolean): Set to `true` to use the _last_ matching key instead of the first one. Only applies if `loose` is `true`. Defaults to `false`.

#### Return Values

* Returns the value from `collection` referenced by `keychain`.
* If no such value is found, returns `elseReturn` if set.
* Otherwise returns `undefined`.

#### Example

In the following example, `kget` fetches a map key, then an object key, then a string index:

```javascript
const get = require('kget')

const map = new Map()
map.set('mapKey', {objKey: 'string'})

get(map, ['mapKey', 'objKey', 5]) // 'g'
```

### `get.any()`

Has the same signature as the main function, except that the second parameter is called `keychains` and expects an array of keys or keychain arrays to be tried one-by-one until one of them points to a value.

#### Example

```javascript
const get = require('kget')

get.any({c: 3, d: 4}, [['a', 'subkey'], 'b', 'c']) // 3
```

The function tries the keys `a.subkey`, `b`, and `c` in order. The first key found (`c`) has its value returned.

### `get.in()`

This method is an alias for calling the main `get()` method with the `inObj` option set to `true`.

### `get.any.in()`

This method is an alias for calling `get.any()` with the `inObj` option set to `true`.

### `get.key()`

This method allows you to determine the key that would be retrieved when loose equivalence is used.

#### Parameters

1. Bindable: `collection` (Array, iterator, Map, Object, Set, string, or Typed Array): The key-value collection from which to retrieve a value.
2. `key` (any): A key which may or may not exist in `collection`. (This can only be a single key, not a key chain.)
3. Optional: Object argument: The same options as in the base `get()` function.

#### Return Values

* If `key` exists in `collection`:
    * If `loose` is set to `true` in the options argument, the first key in `collection` that is loosely equal to `key` will be returned.
    * Otherwise, `key` is returned as-is.
* If `key` does _not_ exist in `collection`, the return value is `undefined`.

#### Example

```javascript
const get = require('kget')

const a = ['key']
const b = ['key']

const map = new Map()
map.set(a, 'value a')
map.set(b, 'value b')

get(map, b) // 'value b'
get(map, b, {loose: true}) // 'value a'

get.key(map, b) === b // true
get.key(map, b, {loose: true}) === a // true
```

### `get.entry()`

#### Parameters

1. Bindable: `collection` (Array, iterator, Map, Object, Set, string, or Typed Array): The key-value collection from which to retrieve a value.
2. `key` (any): A key which may or may not exist in `collection`. (This can only be a single key, not a key chain.)
3. Optional: Object argument: Any of (as defined above): `arrays`, `maps`, `sets`, `weakMaps`, `elseReturn`, `elseThrow`, `inObj`, `loose`, `looselyEquals`, and `preferStrict`.

#### Return Values

* If the `key` is found, returns a two-element array containing the matched key and the retrieved value.
* If the `key` is not found, returns `elseReturn` if provided, otherwise `undefined`.

## Related

The “k” family of modules works on keyed/indexed collections.

* [khas](https://github.com/lamansky/khas)
* [kedit](https://github.com/lamansky/kedit)
* [kset](https://github.com/lamansky/kset)
* [kinc](https://github.com/lamansky/kinc)
* [kdel](https://github.com/lamansky/kdel)

The “v” family of modules works on any collection of values.

* [vhas](https://github.com/lamansky/vhas)
* [vget](https://github.com/lamansky/vget)
* [vsize](https://github.com/lamansky/vsize)
* [vadd](https://github.com/lamansky/vadd)
* [vdel](https://github.com/lamansky/vdel)
