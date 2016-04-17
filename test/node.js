var test = require('tape')
var h = require('virtual-dom/h')
var partial = require('ap').partial
// var raf = require('raf')
var thermometer = require('thermometer')
var Node = require('../src/node')

function createNode (data, options, renderContent, callback) {
  return thermometer.createComponent(
    Node,
    data,
    options || {},
    renderContent || partial(h, 'div'),
    callback
  )
}

test('phases', function (t) {
  t.test('enter: default class', function (t) {
    t.plan(2)
    createNode(null, null, null, function (state, element, done) {
      t.equal(state.phase(), 'enter')
      t.equal(element.className, 'enter')
      done()
    })
  })

  t.test('enter: custom class', function (t) {
    t.plan(1)
    createNode({}, {enter: ['enterOne', 'enterTwo']}, null, function (state, element, done) {
      t.equal(element.className, 'enterOne')
      done()
    })
  })

  t.test('enter-active: default class', function (t) {
    t.plan(2)
    createNode({phase: 'enter-active'}, null, null, function (state, element, done) {
      t.equal(state.phase(), 'enter-active')
      t.equal(element.className, 'enter enter-active')
      done()
    })
  })

  t.test('enter-active: custom class', function (t) {
    t.plan(1)
    createNode({phase: 'enter-active'}, {enter: ['enterOne', 'enterTwo']}, null, function (state, element, done) {
      t.equal(element.className, 'enterTwo')
      done()
    })
  })

  t.test('leave: default class', function (t) {
    t.plan(2)
    createNode({phase: 'leave'}, null, null, function (state, element, done) {
      t.equal(state.phase(), 'leave')
      t.equal(element.className, 'leave')
      done()
    })
  })

  t.test('leave: custom class', function (t) {
    t.plan(1)
    createNode({phase: 'leave'}, {leave: ['leaveOne', 'leaveTwo']}, null, function (state, element, done) {
      t.equal(element.className, 'leaveOne')
      done()
    })
  })

  t.test('leave-active: default class', function (t) {
    t.plan(2)
    createNode({phase: 'leave-active'}, null, null, function (state, element, done) {
      t.equal(state.phase(), 'leave-active')
      t.equal(element.className, 'leave leave-active')
      done()
    })
  })

  t.test('leave-active: custom class', function (t) {
    t.plan(1)
    createNode({phase: 'leave-active'}, {leave: ['leaveOne', 'leaveTwo']}, null, function (state, element, done) {
      t.equal(element.className, 'leaveTwo')
      done()
    })
  })
})

test('transitionend after enter', function (t) {
  t.plan(1)
  createNode(null, null, null, function (state, element, done) {
    element.addEventListener('transitionend', function () {
      t.pass('transitionend happened')
    })
  })
})

test('onDestroy', function (t) {
  t.plan(1)
  var state = Node()

  Node.onDestroy(state, function () {
    t.pass('destroy called')
  })
  state.phase.set('destroy')
})
