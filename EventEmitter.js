(function() {
  const root = (typeof self == 'object' && self.self == self && self) ||
    (typeof global == 'object' && global.global == global && global) ||
    this || {}
  console.log(root)
  function isValidListener(listener) {
    if (typeof listener === 'function') {
      return true
    } else if (listener && typeof listener === 'object') {
      return isValidListener(listener.listener)
    } else {
      return false
    }
  }

  function indexOf (array, item) {
    let result = -1
    item = typeof item === 'object' ? item.listener : item
    for(let i = 0; i < array.length; i++) {
      if (array[i].listener === item) {
        result = i
        break
      }
    }
    return result
  }

  function EventEmitter() {
    this.__events = {}
  }

  EventEmitter.VERSION = '1.0.0'

  let proto = EventEmitter.prototype

  proto.on = function(eventName, listener) {
    if (!eventName || !listener) return
    
    if (!isValidListener(listener)) {
      throw new TypeError('listener must be a function')
    }

    let events = this.__events

    let listeners = events[eventName] = events[eventName] || []
    let listenerIsWrapped = typeof listener === 'object'
    
    if (indexOf(listeners, listener) === -1) {
      listeners.push(listenerIsWrapped ? listener : {
        listener: listener,
        once: false
      })
    }
    return this
  }

  proto.once = function(eventName, listener) {
    return this.on(eventName, {
      listener: listener,
      once: true
    })
  }

  proto.off = function(eventName, listener) {
    let listeners = this.__events[eventName]
    if (!listeners) return

    let index
    for(let i = 0; i < listeners.length; i++) {
      if (listeners[i] && listeners[i].listener === listener) {
        index = i
        break
      }
    }

    if (typeof index !== 'undefined') {
      listeners.splice(index, 1, null)
    }
    return this
  }

  proto.emit = function (eventName, args) {
    const listeners = this.__events[eventName]
    if (!listeners) return

    for(let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      if (listener) {
        listener.listener.apply(this, args || [])
        if (listener.once) {
          this.off(eventName, listener.listener)
        }
      }
    }
    return this
  }

  proto.allOff = function (eventName) {
    if (eventName && this.__events[eventName]) {
      this.__events[eventName] = []
    } else {
      this.__events = {}
    }
  }

  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = EventEmitter
    }
    exports.EventEmitter = EventEmitter
  } else {
    root.EventEmitter = EventEmitter
  }
})()