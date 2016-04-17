var Store = require('weakmap-shim/create-store')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var Delegator = require('dom-delegator')
var Animation = require('./animation')

var delegator = Delegator()
var animationStore = Store()

module.exports = function createWidget (visible, options, renderContent) {
  return new Widget(visible, options, renderContent)
}

function Widget (visible, options, renderContent) {
  this.visible = visible
  this.options = options
  this.renderContent = renderContent
}

Widget.prototype = {
  type: 'Widget',
  init: init,
  update: update,
  destroy: destroy
}

function init () {
  var state = Animation({visible: this.visible})

  var vtree = Animation.render(state(), this.options, this.renderContent)
  var element = createElement(vtree)
  var store = animationStore(element)

  store.widget = this
  store.state = state
  store.vtree = vtree
  store.unlisten = state(rerender)

  delegator.listenTo('transitionend')
  delegator.listenTo('webkitTransitionEnd')

  return element

  function rerender (data) {
    var vtree = Animation.render(data, store.widget.options, store.widget.renderContent)
    var patches = diff(store.vtree, vtree)
    patch(element, patches)

    store.vtree = vtree
  }
}

function update (prev, element) {
  var store = animationStore(element)
  if (!store) throw new Error('Store does not exist')

  // Make sure the store has a pointer to the latest widget with the latest options,
  // then cause a state set which will cause a rerender
  store.widget = this
  store.state.visible.set(this.visible)

  return element
}

function destroy (domNode) {
  var store = animationStore(domNode)
  if (!store) throw new Error('Store does not exist')

  store.unlisten()
  delegator.unlistenTo('transitionend')
  delegator.unlistenTo('webkitTransitionEnd')
}
