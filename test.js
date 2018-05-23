'use strict'

const assert = require('assert')
const get = require('.')
const isArrayWith = require('is-array-with')

describe('get()', function () {
  it('should fetch Array value using single index', function () {
    assert.strictEqual(get(['a', 'b'], 1), 'b')
  })

  it('should fetch Array value using index chain', function () {
    assert.strictEqual(get([['value']], [0, 0]), 'value')
  })

  it('should fetch Object value using single key', function () {
    assert.strictEqual(get({a: 1}, 'a'), 1)
  })

  it('should fetch Object value using key chain', function () {
    assert.strictEqual(get({a: {b: 1}}, ['a', 'b']), 1)
  })

  it('should fetch inherited Object value if `inObj` is true', function () {
    class Cls {
      get key () { return 'value' }
    }
    assert.strictEqual(typeof get(new Cls(), 'key'), 'undefined')
    assert.strictEqual(get(new Cls(), 'key', {inObj: true}), 'value')
  })

  it('should fetch Map value using single key', function () {
    assert.strictEqual(get(new Map([['a', 1]]), 'a'), 1)
  })

  it('should fetch Map value using key chain', function () {
    assert.strictEqual(get(new Map([['one', new Map([['two', 'value']])]]), ['one', 'two']), 'value')
  })

  it('should fetch Set value using single index', function () {
    assert.strictEqual(get(new Set(['a', 'b']), 1), 'b')
  })

  it('should fetch String character using single index', function () {
    assert.strictEqual(get('test', 1), 'e')
  })

  it('should fetch WeakMap value using single key', function () {
    const key = {}
    assert.strictEqual(get(new WeakMap([[key, 'value']]), key), 'value')
  })

  it('should support mixed nested collection types', function () {
    const map = new Map()
    map.set('mapKey', {objKey: 'string'})
    assert.strictEqual(get(map, ['mapKey', 'objKey', 5]), 'g')
  })

  it('should fetch value using equivalent key if `loose` is true', function () {
    const map = new Map([[{key: true}, 'value']])
    assert.strictEqual(typeof get(map, {key: true}), 'undefined')
    assert.strictEqual(get(map, {key: true}, {loose: true}), 'value')
  })

  it('should support the bind operator', function () {
    assert.strictEqual(get.call({a: 1}, 'a'), 1)
  })

  describe('#any()', function () {
    it('should fetch Object value using any key', function () {
      assert.strictEqual(get.any({yes: {sub: 1}}, ['no', ['yes', 'sub']]), 1)
    })
  })

  describe('#in()', function () {
    it('should fetch inherited Object value', function () {
      class Cls {
        get key () { return 'value' }
      }
      assert.strictEqual(typeof get(new Cls(), 'key'), 'undefined')
      assert.strictEqual(get.in(new Cls(), 'key'), 'value')
    })
  })

  describe('#any#in()', function () {
    it('should fetch inherited Object value using any key', function () {
      class Cls {
        get key () { return 'value' }
      }
      assert.strictEqual(get.any.in(new Cls(), ['notAKey', 'key']), 'value')
    })
  })

  describe('#key()', function () {
    it('should return a Map key as-is if it exists', function () {
      const key = ['key']
      assert.strictEqual(get.key(new Map([[key, 'value']]), key), key)
    })

    it('should return an Object key as-is if it exists', function () {
      assert.strictEqual(get.key({key: 'value'}, 'key'), 'key')
    })

    it('should return undefined if the Map key does not exist', function () {
      assert.strictEqual(typeof get.key(new Map(), {}), 'undefined')
    })

    it('should return undefined if the Object key does not exist', function () {
      assert.strictEqual(typeof get.key({}, 'key'), 'undefined')
    })

    it('should return an equivalent Map key if `loose` is true', function () {
      const a = ['key']
      const b = ['key']
      assert.strictEqual(get.key(new Map([[a, 1]]), b, {loose: true}), a)
    })

    it('should return an equivalent Object key if `loose` is true', function () {
      const obj = {a: 1}
      assert.strictEqual(get.key(obj, 'b', {loose: true, looselyEquals: () => true}), 'a')
    })

    it('should return the first equivalent Map key if `loose` is true', function () {
      const a = ['key']
      const b = ['key']
      const map = new Map([[a, 'a'], [b, 'b']])
      assert.strictEqual(get.key(map, b, {loose: true}), a)
    })

    it('should return the last equivalent Map key if `loose` and `reverse` are true', function () {
      const a = ['key']
      const b = ['key']
      const map = new Map([[a, 'a'], [b, 'b']])
      assert.strictEqual(get.key(map, a, {loose: true, reverse: true}), b)
    })

    it('should return the first equivalent Object key if `loose` is true', function () {
      const obj = {a: 1, b: 2}
      assert.strictEqual(get.key(obj, 'b', {loose: true, looselyEquals: () => true}), 'a')
    })

    it('should return the last equivalent Object key if `loose` and `reverse` are true', function () {
      const obj = {a: 1, b: 2}
      assert.strictEqual(get.key(obj, 'a', {loose: true, looselyEquals: () => true, reverse: true}), 'b')
    })

    it('should favor strictly-identical Map keys if `preferStrict` is true', function () {
      const a = ['key']
      const b = ['key']
      const map = new Map([[a, 'a'], [b, 'b']])
      assert.strictEqual(get.key(map, b, {loose: true}), a)
      assert.strictEqual(get.key(map, b, {loose: true, preferStrict: true}), b)
    })

    it('should favor strictly-identical Object keys if `preferStrict` is true', function () {
      const obj = {a: 1, b: 2}
      const looselyEquals = () => true
      assert.strictEqual(get.key(obj, 'b', {loose: true, looselyEquals}), 'a')
      assert.strictEqual(get.key(obj, 'b', {loose: true, looselyEquals, preferStrict: true}), 'b')
    })

    it('should support the bind operator', function () {
      assert.strictEqual(get.key.call({key: 'value'}, 'key'), 'key')
    })
  })

  describe('#entry()', function () {
    it('should return a Map entry if the key exists', function () {
      const key = ['key']
      assert(isArrayWith(get.entry(new Map([[key, 'value']]), key), key, 'value'))
    })

    it('should return an Object entry if the key exists', function () {
      assert(isArrayWith(get.entry({key: 'value'}, 'key'), 'key', 'value'))
    })

    it('should return undefined if the Map key does not exist', function () {
      assert.strictEqual(typeof get.entry(new Map(), {}), 'undefined')
    })

    it('should return undefined if the Object key does not exist', function () {
      assert.strictEqual(typeof get.entry({}, 'key'), 'undefined')
    })

    it('should return an equivalent Map key if `loose` is true', function () {
      const a = ['key']
      const b = ['key']
      assert(isArrayWith(get.entry(new Map([[a, 1]]), b, {loose: true}), a, 1))
    })

    it('should return an equivalent Object key if `loose` is true', function () {
      const obj = {a: 1}
      assert(isArrayWith(get.entry(obj, 'b', {loose: true, looselyEquals: () => true}), 'a', 1))
    })

    it('should support the bind operator', function () {
      assert(isArrayWith(get.entry.call({key: 'value'}, 'key'), 'key', 'value'))
    })
  })
})
