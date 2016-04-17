var BaseEvent = require('value-event/base-event')
var AnimationNode = require('./node')

module.exports = BaseEvent(handleTransitionEnd)

function handleTransitionEnd (event, broadcast) {
  broadcast({
    id: event.target.getAttribute(AnimationNode.DOM_ID_PROP)
  })
}
