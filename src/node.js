var Struct = require('observ-struct')
var Observ = require('observ')
var Enum = require('observ-enum')
var Event = require('weakmap-event')
var dispatchEvent = require('dispatch-event')
var partial = require('ap').partial
var nextTick = require('next-tick')
var raf = require('raf')

var PHASES = [
  'enter',
  'enter-active',
  'present',
  'leave',
  'leave-active',
  'destroy'
]
var ENTER_CLASSES = ['enter', 'enter enter-active']
var LEAVE_CLASSES = ['leave', 'leave leave-active']

var Phase = Enum(PHASES)

module.exports = AnimationNode

AnimationNode.DOM_ID_PROP = 'animation-node-id'

function AnimationNode (data) {
  data = data || {}
  var state = Struct({
    phase: Phase(data.phase || 'enter'),
    id: Observ(data.id)
  })

  state.phase(onPhase)

  return state

  function onPhase (phase) {
    if (phase === 'destroy') {
      DestroyEvent.broadcast(state, {})
    }
  }
}

var DestroyEvent = Event()
AnimationNode.onDestroy = DestroyEvent.listen

AnimationNode.nextPhase = function nextPhase (state) {
  var currentIndex = PHASES.indexOf(state.phase())
  return state.phase.set(PHASES[currentIndex + 1])
}

AnimationNode.render = function render (state, options, renderContent) {
  options = options || {}
  options.enter = options.enter || ENTER_CLASSES
  options.leave = options.leave || LEAVE_CLASSES

  // Take the content we got back and mutate animations onto it
  var vtree = renderContent()
  var key = vtree.key
  var properties = vtree.properties

  vtree.key = key ? (key + state.id) : state.id
  properties.attributes = properties.attributes || {}
  properties.attributes[AnimationNode.DOM_ID_PROP] = state.id
  properties.className = [
    properties.className,
    state.phase === 'enter' && options.enter[0],
    state.phase === 'enter-active' && options.enter[1],
    state.phase === 'leave' && options.leave[0],
    state.phase === 'leave-active' && options.leave[1]
  ].filter(Boolean).join(' ')

  properties['hook' + state.id] = Object.create({
    hook: partial(onEnter, state.phase)
  })

  return vtree
}

// onEnter: once the node is in the dom for one frame, send a transitionend
// event up to the parent. The parent will tell this child to advance to the next phase
function onEnter (phase, node) {
  if (phase !== 'enter') return

  // vdom hooks act like this: it runs right before the element is in the dom
  // We wait one tick for the element to be in the dom, then wait one frame, then
  // advance phase
  return nextTick(function () {
    raf(function () {
      dispatchEvent(node, 'transitionend', {bubbles: true})
    })
  })
}

AnimationNode.leave = function leave (state) {
  // If not in the correct state, instantly remove
  if (!/present|enter/.test(state.phase())) {
    return state.phase.set('destroy')
  }

  state.phase.set('leave')
  raf(function () {
    state.phase.set('leave-active')
  })
}
