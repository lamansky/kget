'use strict'

const arrify = require('arrify')
const entries = require('entries-iterator')
const equals = require('equals')
const is = require('is-instance-of')
const otherwise = require('otherwise')
const sbo = require('sbo')
const xfn = require('xfn')

const notFound = Symbol('notFound')

module.exports = xfn({
  optionArg: 2,
  optionProps: {in: {inObj: true}},
  pluralArg: 1,
  pluralProp: 'any',
  pluralFirst: true,
}, function get (collection, keychains, options = {}) {
  for (const keychain of keychains) {
    const value = getByKeyChain(collection, keychain, options)
    if (value !== notFound) return value
  }
  return otherwise(options)
})

const ignoreThis = [module.exports]
module.exports.entry = sbo({ignoreThis}, getEntry)
module.exports.key = sbo({ignoreThis}, getKey)

function getByKeyChain (value, keys, {get = defaultGet, ...options} = {}) {
  for (const key of arrify(keys)) {
    if ((value = get(value, key, options, notFound, () => defaultGet(value, key, options, notFound))) === notFound) return notFound
  }
  return value
}

function getEntry (collection, key, {loose, looselyEquals = equals, maps = [], preferStrict, weakMaps = [], ...options} = {}) {
  if (is(collection, ['WeakMap', weakMaps])) return collection.has(key) ? [key, collection.get(key)] : otherwise(options)
  if ((!loose || preferStrict) && is(collection, ['Map', maps]) && collection.has(key)) return [key, collection.get(key)]
  let looseMatch
  for (const [k, v] of entries(collection, {...options, maps, reflectObj: true})) {
    if (k === key) return [k, v]
    if (loose && looselyEquals(k, key)) {
      if (preferStrict) {
        if (!looseMatch) looseMatch = [k, v]
      } else {
        return [k, v]
      }
    }
  }
  return looseMatch || otherwise(options)
}

function getEntryPart (part, collection, key, options = {}) {
  const entry = getEntry(collection, key, {...options, elseReturn: notFound})
  return entry === notFound ? otherwise(options) : entry[part]
}

function getKey (...args) {
  return getEntryPart(0, ...args)
}

function defaultGet (collection, key, options, elseReturn) {
  return getEntryPart(1, collection, key, {...options, elseReturn})
}
