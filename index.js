var L = require('leaflet')
require('./layout.css')
require('./range.css')

var mapWasDragEnabled

// Leaflet v0.7 backwards compatibility
function on (el, types, fn, context) {
  types.split(' ').forEach(function (type) {
    L.DomEvent.on(el, type, fn, context)
  })
}

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
  this._map.dragging.disable()
}

function uncancelMapDrag (e) {
  if (!mapWasDragEnabled) return
  this._refocusOnMap(e)
  this._map.dragging.enable()
}

function noop () {
  return
}

L.Control.SideBySide = L.Control.extend({
  initialize: function (leftLayers, rightLayers) {
    this._leftLayers = Array.isArray(leftLayers) ? leftLayers : [leftLayers]
    this._rightLayers = Array.isArray(rightLayers) ? rightLayers : [rightLayers]
  },

  getPosition: noop,

  setPosition: noop,

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
    this._addEvents()
    this._updateLayers()
    this._updateClip()
    return this
  },

  remove: function () {
    if (!this._map) {
      return this
    }
    this._removeEvents()
    L.DomUtil.remove(this._container)

    this._map = null

    return this
  },

  _updateClip: function () {
    var map = this._map
    var rangeValue = this._range.value
    var nw = map.containerPointToLayerPoint([0, 0])
    var se = map.containerPointToLayerPoint(map.getSize())
    var offset = (0.5 - rangeValue) * 44
    var clipX = nw.x + (se.x - nw.x) * rangeValue + offset

    this._divider.style.left = map.getSize().x * rangeValue + offset + 'px'
    var clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)'
    var clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)'
    if (this._leftLayer) {
      this._leftLayer.getContainer().style.clip = clipLeft
    }
    if (this._rightLayer) {
      this._rightLayer.getContainer().style.clip = clipRight
    }
  },

  _updateLayers: function () {
    this._leftLayer = this._rightLayer = null
    this._leftLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) this._leftLayer = layer
    }, this)
    this._rightLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) this._rightLayer = layer
    }, this)
    this._updateClip()
  },

  _addEvents: function () {
    var range = this._range
    var map = this._map
    if (!map || !range) return
    map.on('move', this._updateClip, this)
    map.on('layeradd layerremove', this._updateLayers, this)
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
      map.off('layeradd layerremove', this._updateLayers, this)
      map.off('move', this._updateClip, this)
    }
  }
})

L.Control.sideBySide = function (leftLayers, rightLayers, options) {
  return new L.Control.SideBySide(leftLayers, rightLayers, options)
}

module.export = L.Control.sideBySide
