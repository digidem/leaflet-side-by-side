var L = require('leaflet')
require('./layout.css')
require('./range.css')

var mapWasDragEnabled
var mapWasTapEnabled

// Leaflet v0.7 backwards compatibility
function on (el, types, fn, context) {
  types.split(' ').forEach(function (type) {
    L.DomEvent.on(el, type, fn, context)
  })
}

// Leaflet v0.7 backwards compatibility
function off (el, types, fn, context) {
  types.split(' ').forEach(function (type) {
    L.DomEvent.off(el, type, fn, context)
  })
}

function getRangeEvent (rangeInput) {
  return 'oninput' in rangeInput ? 'input' : 'change'
}

function cancelMapDrag () {
  mapWasDragEnabled = this._map.dragging.enabled()
  mapWasTapEnabled = this._map.tap && this._map.tap.enabled()
  this._map.dragging.disable()
  this._map.tap && this._map.tap.disable()
}

function uncancelMapDrag (e) {
  this._refocusOnMap(e)
  if (mapWasDragEnabled) {
    this._map.dragging.enable()
  }
  if (mapWasTapEnabled) {
    this._map.tap.enable()
  }
}

// convert arg to an array - returns empty array if arg is undefined
function asArray (arg) {
  return (arg === undefined) ? [] : Array.isArray(arg) ? arg : [arg]
}

function noop () {
  return
}

function applyToMissingLayers(map, layers, layersToCheckAgainst, applyFunction) {
  // Loops through each layer in layers, and if the layer is on the map but NOT in layersToCheckAgainst,
  // calls applyFunction(layer).
  layers.forEach(function (layer) {
    if (layer && map.hasLayer(layer)) {
      if (layersToCheckAgainst.indexOf(layer) < 0) {
        applyFunction(layer)
      }
    }
  })
}

function setClip(layer, clip) {
  if (layer.getContainer()) {
    layer.getContainer().style.clip = clip
  }
}

L.Control.SideBySide = L.Control.extend({
  options: {
    thumbSize: 42,
    padding: 0
  },

  initialize: function (leftLayers, rightLayers, options) {
    this.setLeftLayers(leftLayers)
    this.setRightLayers(rightLayers)
    L.setOptions(this, options)
  },

  getPosition: function () {
    var rangeValue = this._range.value
    var offset = (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize)
    return this._map.getSize().x * rangeValue + offset
  },

  setPosition: noop,

  includes: L.Mixin.Events,

  addTo: function (map) {
    this.remove()
    this._map = map

    var container = this._container = L.DomUtil.create('div', 'leaflet-sbs', map._controlContainer)

    this._divider = L.DomUtil.create('div', 'leaflet-sbs-divider', container)
    var range = this._range = L.DomUtil.create('input', 'leaflet-sbs-range', container)
    range.type = 'range'
    range.min = 0
    range.max = 1
    range.step = 'any'
    range.value = 0.5
    range.style.paddingLeft = range.style.paddingRight = this.options.padding + 'px'
    this._addEvents()
    this._updateLayers(this._leftLayers, this._rightLayers)
    return this
  },

  remove: function () {
    // Remove the side-by-side control.
    if (!this._map) {
      return this
    }
    this._updateLayers([], [])
    this._removeEvents()
    L.DomUtil.remove(this._container)

    this._map = null

    return this
  },

  setLeftLayers: function (leftLayers) {
    this._updateLayers(asArray(leftLayers), null)
    return this
  },

  setRightLayers: function (rightLayers) {
    this._updateLayers(null, asArray(rightLayers))
    return this
  },

  _updateClip: function () {
    var map = this._map
    var nw = map.containerPointToLayerPoint([0, 0])
    var se = map.containerPointToLayerPoint(map.getSize())
    var clipX = nw.x + this.getPosition()
    var dividerX = this.getPosition()

    this._divider.style.left = dividerX + 'px'
    this.fire('dividermove', {x: dividerX})
    var clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)'
    var clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)'
    this._leftLayers.forEach(function(layer) {
      setClip(layer, clipLeft)
    })
    this._rightLayers.forEach(function(layer) {
      setClip(layer, clipRight)
    })
  },

  _removeClip: function (layer) {
    setClip(layer, '')
  },

  _updateLayers: function (newLeftLayers, newRightLayers) {
    var map = this._map
    if (!map) {
      return this
    }
    var prevLeftLayers = asArray(this._leftLayers)
    var prevRightLayers = asArray(this._rightLayers)

    // If either parameter is not supplied, use the original; this can still lead to events being fired
    // because whether the layer is on the map can change.
    if (!newLeftLayers) {
      newLeftLayers = asArray(this._leftLayers)
    }
    if (!newRightLayers) {
      newRightLayers = asArray(this._rightLayers)
    }
    var that = this
    // Add new layers.
    applyToMissingLayers(map, newLeftLayers, prevLeftLayers, function(layer) {that.fire('leftlayeradd', {layer: layer})})
    applyToMissingLayers(map, newRightLayers, prevRightLayers, function(layer) {that.fire('rightlayeradd', {layer: layer})})
    // Remove layers which were present, but are no longer.
    applyToMissingLayers(map, prevLeftLayers, newLeftLayers, function(layer) {that.fire('leftlayerremove', {layer: layer})})
    applyToMissingLayers(map, prevRightLayers, newRightLayers, function(layer) {that.fire('rightlayerremove', {layer: layer})})

    // Any layers which have been removed from the control need their clip css removed, so they appear on both sides.
    applyToMissingLayers(map, prevLeftLayers.concat(prevRightLayers), newLeftLayers.concat(newRightLayers), that._removeClip)

    // Update our records.
    this._leftLayers = newLeftLayers
    this._rightLayers = newRightLayers

    // Update the clip css for the layers which are on the left or right.
    // Note this uses this._leftLayers and _rightLayers, so we updated them first.
    this._updateClip()
  },

  _updateLayersFromEvent: function () {
    // If a layer is added or removed from the map, we don't need to pass which layer it is.
    this._updateLayers()
  },

  _addEvents: function () {
    var range = this._range
    var map = this._map
    if (!map || !range) return
    map.on('move', this._updateClip, this)
    map.on('layeradd layerremove', this._updateLayersFromEvent, this)
    on(range, getRangeEvent(range), this._updateClip, this)
    on(range, 'mousedown touchstart', cancelMapDrag, this)
    on(range, 'mouseup touchend', uncancelMapDrag, this)
  },

  _removeEvents: function () {
    var range = this._range
    var map = this._map
    if (range) {
      off(range, getRangeEvent(range), this._updateClip, this)
      off(range, 'mousedown touchstart', cancelMapDrag, this)
      off(range, 'mouseup touchend', uncancelMapDrag, this)
    }
    if (map) {
      map.off('layeradd layerremove', this._updateLayersFromEvent, this)
      map.off('move', this._updateClip, this)
    }
  }
})

L.control.sideBySide = function (leftLayers, rightLayers, options) {
  return new L.Control.SideBySide(leftLayers, rightLayers, options)
}

module.exports = L.Control.SideBySide
