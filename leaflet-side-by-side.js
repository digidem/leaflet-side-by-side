(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null)
require('./layout.css')
require('./range.css')
require('./swap.css')

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
  return !arg ? [] : Array.isArray(arg) ? arg : [arg]
}

function noop () {}

L.Control.SideBySide = L.Control.extend({
  options: {
    thumbSize: 30,
    padding: 0,
    swap: false
  },

  swapped: false,

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

  includes: L.Evented.prototype || L.Mixin.Events,

  addTo: function (map) {
    this.remove()
    this._map = map

    var container = this._container = L.DomUtil.create('div', 'leaflet-sbs', map._controlContainer)

    this._divider = L.DomUtil.create('div', 'leaflet-sbs-divider', container)
    var range = this._range = L.DomUtil.create('input', 'leaflet-sbs-range', container)
    range.addEventListener('click', function (e) { e.stopPropagation() })
    range.type = 'range'
    range.min = 0
    range.max = 1
    range.step = 'any'
    range.value = 0.5
    range.style.paddingLeft = range.style.paddingRight = this.options.padding + 'px'

    if (this.options.swap) {
      var swap = (this._swap = L.DomUtil.create('button', 'leaflet-sbs-swap', container))
      swap.type = 'button'
      swap.setAttribute('aria-label', 'Swap images')
      swap.setAttribute('data-left', this.swapped ? 'B' : 'A')
      swap.setAttribute('data-right', this.swapped ? 'A' : 'B')
      swap.style.display = 'none'
      swap.style.paddingLeft = swap.style.paddingRight = this.options.padding + 'px'
      swap.style.top = 'calc(50% + ' + this.options.thumbSize + 'px)'
    }

    this._addEvents()
    this._updateLayers()
    return this
  },

  getWrapper: function (layer) {
    return layer.getContainer ? layer.getContainer() : layer.getPane()
  },

  remove: function () {
    if (!this._map) {
      return this
    }
    if (this._leftLayers) {
      this._leftLayers.forEach(this._updateLayerClip.bind(this, ''))
    }
    if (this._rightLayers) {
      this._rightLayers.forEach(this._updateLayerClip.bind(this, ''))
    }
    this._removeEvents()
    L.DomUtil.remove(this._container)

    this._map = null

    return this
  },

  setLeftLayers: function (leftLayers) {
    this._leftLayers = asArray(leftLayers)
    this._updateLayers()
    return this
  },

  setRightLayers: function (rightLayers) {
    this._rightLayers = asArray(rightLayers)
    this._updateLayers()
    return this
  },

  _updateLayerClip: function (clip, layer) {
    if (typeof layer.getContainer === 'function') {
      // tilelayer
      var container = layer.getContainer()
      if (container !== null && container !== undefined) {
        container.style.clip = clip
      }
    } else if (typeof (layer.getLayers) === 'function') {
      // svg path (geojson)
      try {
        var pane = layer.getPane();
        pane.style.clip = clip;
      } catch (error) {
        console.error(error);//do not like the idea of silent errors
      }
    }
  },

  _updateClip: function () {
    var map = this._map
    var nw = map.containerPointToLayerPoint([0, 0])
    var se = map.containerPointToLayerPoint(map.getSize())
    var clipX = nw.x + this.getPosition()
    var dividerX = this.getPosition()

    this._divider.style.left = dividerX + 'px'
    this.fire('dividermove', { x: dividerX })

    if (this._swap) {
      this._swap.style.display = this._leftLayer && this._rightLayer ? 'block' : 'none'
      this._swap.style.left = dividerX - this.options.thumbSize / 2 + 'px'
      this._swap.setAttribute('data-left', this.swapped ? 'B' : 'A')
      this._swap.setAttribute('data-right', this.swapped ? 'A' : 'B')
    }

    var clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)'
    var clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)'

    this._leftLayers.forEach(this._updateLayerClip.bind(this, clipLeft))
    this._rightLayers.forEach(this._updateLayerClip.bind(this, clipRight))
  },

  _updateLayers: function () {
    if (!this._map) {
      return this
    }
    var prevLeft = this._leftLayer
    var prevRight = this._rightLayer
    this._leftLayer = this._rightLayer = null
    this._leftLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) {
        this._leftLayer = layer
      }
    }, this)
    this._rightLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) {
        this._rightLayer = layer
      }
    }, this)
    if (prevLeft !== this._leftLayer) {
      prevLeft && this.fire('leftlayerremove', { layer: prevLeft })
      this._leftLayer && this.fire('leftlayeradd', { layer: this._leftLayer })
    }
    if (prevRight !== this._rightLayer) {
      prevRight && this.fire('rightlayerremove', { layer: prevRight })
      this._rightLayer && this.fire('rightlayeradd', { layer: this._rightLayer })
    }
    this._updateClip()
  },

  _swapLayers: function () {
    var prevLefts = this._leftLayers
    var prevRights = this._rightLayers
    this._leftLayers = prevRights
    this._rightLayers = prevLefts

    var prevLeft = this._leftLayer
    var prevRight = this._rightLayer
    this._leftLayer = prevRight
    this._rightLayer = prevLeft

    this.swapped = !this.swapped
    this._updateLayers()
    this.fire('swapped', { swapped: this.swapped })
  },

  _addEvents: function () {
    var range = this._range
    var map = this._map
    var swap = this._swap
    if (map) {
      map.on('move', this._updateClip, this)
    }
    if (range) {
      on(range, getRangeEvent(range), this._updateClip, this)
      on(range, L.Browser.touch ? 'touchstart' : 'mousedown', cancelMapDrag, this)
      on(range, L.Browser.touch ? 'touchend' : 'mouseup', uncancelMapDrag, this)
    }
    if (this._leftLayer) {
      this._leftLayer.on('layeradd layerremove', this._updateLayers, this)
    }
    if (this._rightLayer) {
      this._rightLayer.on('layeradd layerremove', this._updateLayers, this)
    }
    if (swap) {
      on(swap, 'click', this._swapLayers, this)
    }
  },

  _removeEvents: function () {
    var range = this._range
    var map = this._map
    var swap = this._swap
    if (map) {
      map.off('move', this._updateClip, this)
    }
    if (range) {
      off(range, getRangeEvent(range), this._updateClip, this)
      off(range, L.Browser.touch ? 'touchstart' : 'mousedown', cancelMapDrag, this)
      off(range, L.Browser.touch ? 'touchend' : 'mouseup', uncancelMapDrag, this)
    }
    if (this._leftLayer) {
      this._leftLayer.off('layeradd layerremove', this._updateLayers, this)
    }
    if (this._rightLayer) {
      this._rightLayer.off('layeradd layerremove', this._updateLayers, this)
    }
    if (swap) {
      off(swap, 'click', this._swapLayers, this)
    }
  }
})

L.control.sideBySide = function (leftLayers, rightLayers, options) {
  return new L.Control.SideBySide(leftLayers, rightLayers, options)
}

module.exports = L.Control.SideBySide

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./layout.css":2,"./range.css":4,"./swap.css":5}],2:[function(require,module,exports){
var inject = require('./node_modules/cssify');
var css = ".leaflet-sbs-range {\n    position: absolute;\n    top: 50%;\n    width: 100%;\n    z-index: 999;\n}\n.leaflet-sbs-divider {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 50%;\n    margin-left: -1px;\n    width: 2px;\n    background-color: #2C405A;\n    pointer-events: none;\n    z-index: 999;\n}\n";
inject(css, undefined, '_1u09j9r');
module.exports = css;

},{"./node_modules/cssify":3}],3:[function(require,module,exports){
'use strict'

function injectStyleTag (document, fileName, cb) {
  var style = document.getElementById(fileName)

  if (style) {
    cb(style)
  } else {
    var head = document.getElementsByTagName('head')[0]

    style = document.createElement('style')
    if (fileName != null) style.id = fileName
    cb(style)
    head.appendChild(style)
  }

  return style
}

module.exports = function (css, customDocument, fileName) {
  var doc = customDocument || document
  /* istanbul ignore if: not supported by Electron */
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css
    return sheet.ownerNode
  } else {
    return injectStyleTag(doc, fileName, function (style) {
      /* istanbul ignore if: not supported by Electron */
      if (style.styleSheet) {
        style.styleSheet.cssText = css
      } else {
        style.innerHTML = css
      }
    })
  }
}

module.exports.byUrl = function (url) {
  /* istanbul ignore if: not supported by Electron */
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode
  } else {
    var head = document.getElementsByTagName('head')[0]
    var link = document.createElement('link')

    link.rel = 'stylesheet'
    link.href = url

    head.appendChild(link)
    return link
  }
}

},{}],4:[function(require,module,exports){
var inject = require('./node_modules/cssify');
var css = ".leaflet-sbs-range {\n    -webkit-appearance: none;\n    display: inline-block !important;\n    vertical-align: middle;\n    height: 0;\n    padding: 0;\n    margin: 0;\n    border: 0;\n    background: rgba(0, 0, 0, 0.25);\n    min-width: 100px;\n    cursor: pointer;\n    pointer-events: none;\n    z-index: 999;\n}\n.leaflet-sbs-range::-ms-fill-upper {\n    background: transparent;\n}\n.leaflet-sbs-range::-ms-fill-lower {\n    background: rgba(255, 255, 255, 0.25);\n}\n/* Browser thingies */\n\n.leaflet-sbs-range::-moz-range-track {\n    opacity: 0;\n}\n.leaflet-sbs-range::-ms-track {\n    opacity: 0;\n}\n.leaflet-sbs-range::-ms-tooltip {\n    display: none;\n}\n/* For whatever reason, these need to be defined\n * on their own so dont group them */\n\n.leaflet-sbs-range::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    margin: 0;\n    padding: 0;\n    background: #fff;\n    height: 30px;\n    width: 30px;\n    border-radius: 50%;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 2px solid #2c405a;\n    color: #2c405a;\n    background-image: url(\"data:image/svg+xml,<svg width='6' height='14' xmlns='http://www.w3.org/2000/svg'><path d='M.5.333v13.333h1.667V.333H.5zm5 13.333V.333H3.833v13.333H5.5z' fill='%232C405A'/></svg>\");\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 6px 14px;\n}\n.leaflet-sbs-range::-ms-thumb {\n    margin: 0;\n    padding: 0;\n    background: #fff;\n    height: 30px;\n    width: 30px;\n    border-radius: 50%;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 2px solid #2c405a;\n    color: #2c405a;\n    background-image: url(\"data:image/svg+xml,<svg width='6' height='14' xmlns='http://www.w3.org/2000/svg'><path d='M.5.333v13.333h1.667V.333H.5zm5 13.333V.333H3.833v13.333H5.5z' fill='%232C405A'/></svg>\");\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 6px 14px;\n}\n.leaflet-sbs-range::-moz-range-thumb {\n    padding: 0;\n    right: 0;\n    background: #fff;\n    height: 30px;\n    width: 30px;\n    border-radius: 50%;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 2px solid #2c405a;\n    color: #2c405a;\n    background-image: url(\"data:image/svg+xml,<svg width='6' height='14' xmlns='http://www.w3.org/2000/svg'><path d='M.5.333v13.333h1.667V.333H.5zm5 13.333V.333H3.833v13.333H5.5z' fill='%232C405A'/></svg>\");\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 6px 14px;\n}\n.leaflet-sbs-range:disabled::-moz-range-thumb {\n    cursor: default;\n}\n.leaflet-sbs-range:disabled::-ms-thumb {\n    cursor: default;\n}\n.leaflet-sbs-range:disabled::-webkit-slider-thumb {\n    cursor: default;\n}\n.leaflet-sbs-range:disabled {\n    cursor: default;\n}\n.leaflet-sbs-range:focus {\n    outline: none !important;\n}\n.leaflet-sbs-range::-moz-focus-outer {\n    border: 0;\n}\n";
inject(css, undefined, '_g4l216');
module.exports = css;

},{"./node_modules/cssify":3}],5:[function(require,module,exports){
var inject = require('./node_modules/cssify');
var css = ".leaflet-sbs-swap {\n    position: absolute;\n    -webkit-appearance: none;\n    margin: 0;\n    padding: 0;\n    background:  #2C405A;\n    height: 30px;\n    width: 30px;\n    border-radius: 50%;\n    cursor: pointer;\n    pointer-events: auto;\n    border: 2px solid #2C405A;\n    color: white;\n    background-image: url(\"data:image/svg+xml,<svg width='16' height='12' xmlns='http://www.w3.org/2000/svg'><path d='M3.825 5.166L.5 8.499l3.325 3.334v-2.5h5.842V7.666H3.825v-2.5zM15.5 3.499L12.175.166v2.5H6.333v1.667h5.842v2.5L15.5 3.499z' fill='white'/></svg>\");\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 16px 12px;\n    z-index: 999;\n}\n\n.leaflet-sbs-swap:focus {\n    outline: none;\n    box-shadow: 0px 0px 4px white;\n}\n\n.leaflet-sbs-swap::before,\n.leaflet-sbs-swap::after {\n    color: white;\n    position: absolute;\n    font-size: 8px;\n    font-weight: bolder;\n}\n\n.leaflet-sbs-swap::before {\n    content: 'A';\n    content: attr(data-left);\n    top: calc(50% - 11px);\n    left: calc(50% - 11px);\n}\n\n.leaflet-sbs-swap::after {\n    content: 'B';\n    content: attr(data-right);\n    top: calc(50%);\n    left: calc(50% + 4px);\n}\n";
inject(css, undefined, '_n7f9c');
module.exports = css;

},{"./node_modules/cssify":3}]},{},[1]);
