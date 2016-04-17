var State = require('dover')
var VarHash = require('observ-varhash')
var Observ = require('observ')
var ObservThunk = require('observ-thunk')
var h = require('virtual-dom/h')
var watch = require('observ/watch')
var cuid = require('cuid')
var AnimationNode = require('./node')
var transitionEvent = require('./transitionend')

module.exports = Animation

function Animation (data) {
  data = data || {}

  var state = State({
    visible: Observ(data.visible),
    nodes: VarHash({}), // VarHash<nodeId: AnimationNode>
    current: Observ(null), // nodeId
    channels: {
      transition: transition
    }
  })

  watch(state.visible, ObservThunk(onVisible))

  return state

  function onVisible (visible) {
    var current = state.current()
    if (visible && !current) {
      createNode(state)
    } else if (!visible && current) {
      removeCurrentNode(state)
    }
  }
}

// Whenever any transitionend bubbles up from the children, advance that
// child to the next phase.
function transition (state, data) {
  var node = state.nodes.get(data.id)
  if (!node) return

  return AnimationNode.nextPhase(node)
}

Animation.render = function render (state, options, renderContent) {
  var renderOpts = {
    'ev-transitionend': transitionEvent(state.channels.transition),
    'ev-webkitTransitionEnd': transitionEvent(state.channels.transition)
  }

  return h('animator', renderOpts, Object.keys(state.nodes).map(renderNode))

  function renderNode (id) {
    return AnimationNode.render(state.nodes[id], options, renderContent)
  }
}

function createNode (state) {
  var id = 'anim_' + cuid()
  var node = AnimationNode({id: id})
  var unlisten = AnimationNode.onDestroy(node, onDestroy)

  state.current.set(id)
  state.nodes.put(id, node)

  return node

  function onDestroy () {
    unlisten()
    state.nodes.delete(id)
  }
}

function removeCurrentNode (state) {
  var node = state.nodes.get(state.current())
  if (!node) return

  state.current.set(null)
  AnimationNode.leave(node)
}
