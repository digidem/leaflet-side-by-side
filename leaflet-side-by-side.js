(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // layout.css
  var layout_default;
  var init_layout = __esm({
    "layout.css"() {
      layout_default = ".leaflet-sbs-range {\n    position: absolute;\n    top: 50%;\n    width: 100%;\n    z-index: 999;\n}\n.leaflet-sbs-divider {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 50%;\n    margin-left: -2px;\n    width: 4px;\n    background-color: #fff;\n    pointer-events: none;\n    z-index: 999;\n}\n";
    }
  });

  // range.css
  var range_default;
  var init_range = __esm({
    "range.css"() {
      range_default = ".leaflet-sbs-range {\n    -webkit-appearance: none;\n    display: inline-block !important;\n    vertical-align: middle;\n    height: 0;\n    padding: 0;\n    margin: 0;\n    border: 0;\n    background: rgba(0, 0, 0, 0.25);\n    min-width: 100px;\n    cursor: pointer;\n    pointer-events: none;\n    z-index: 999;\n}\n\n.leaflet-sbs-range::-ms-fill-upper {\n    background: transparent;\n}\n\n.leaflet-sbs-range::-ms-fill-lower {\n    background: rgba(255, 255, 255, 0.25);\n}\n\n/* Browser thingies */\n\n.leaflet-sbs-range::-moz-range-track {\n    opacity: 0;\n}\n\n.leaflet-sbs-range::-ms-track {\n    opacity: 0;\n}\n\n.leaflet-sbs-range::-ms-tooltip {\n    display: none;\n}\n\n/* For whatever reason, these need to be defined\n * on their own so dont group them */\n\n.leaflet-sbs-range::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    margin: 0;\n    padding: 0;\n    background: #fff;\n    height: 40px;\n    width: 40px;\n    border-radius: 20px;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 1px solid #ddd;\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC);\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 40px 40px;\n}\n\n.leaflet-sbs-range::-ms-thumb {\n    margin: 0;\n    padding: 0;\n    background: #fff;\n    height: 40px;\n    width: 40px;\n    border-radius: 20px;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 1px solid #ddd;\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC);\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 40px 40px;\n}\n\n.leaflet-sbs-range::-moz-range-thumb {\n    padding: 0;\n    right: 0;\n    background: #fff;\n    height: 40px;\n    width: 40px;\n    border-radius: 20px;\n    cursor: ew-resize;\n    pointer-events: auto;\n    border: 1px solid #ddd;\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC);\n    background-position: 50% 50%;\n    background-repeat: no-repeat;\n    background-size: 40px 40px;\n}\n\n.leaflet-sbs-range:disabled::-moz-range-thumb {\n    cursor: default;\n}\n\n.leaflet-sbs-range:disabled::-ms-thumb {\n    cursor: default;\n}\n\n.leaflet-sbs-range:disabled::-webkit-slider-thumb {\n    cursor: default;\n}\n\n.leaflet-sbs-range:disabled {\n    cursor: default;\n}\n\n.leaflet-sbs-range:focus {\n    outline: none !important;\n}\n\n.leaflet-sbs-range::-moz-focus-outer {\n    border: 0;\n}";
    }
  });

  // index.js
  var require_index = __commonJS({
    "index.js"(exports, module) {
      init_layout();
      init_range();
      function injectStyle(css) {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
      }
      injectStyle(layout_default);
      injectStyle(range_default);
      var mapWasDragEnabled;
      var mapWasTapEnabled;
      function getRangeEvent(rangeInput) {
        return "oninput" in rangeInput ? "input" : "change";
      }
      function cancelMapDrag() {
        mapWasDragEnabled = this._map.dragging.enabled();
        mapWasTapEnabled = this._map.tap && this._map.tap.enabled();
        this._map.dragging.disable();
        this._map.tap && this._map.tap.disable();
      }
      function uncancelMapDrag(e) {
        this._refocusOnMap(e);
        if (mapWasDragEnabled) {
          this._map.dragging.enable();
        }
        if (mapWasTapEnabled) {
          this._map.tap.enable();
        }
      }
      function asArray(arg) {
        return arg === "undefined" ? [] : Array.isArray(arg) ? arg : [arg];
      }
      function noop() {
      }
      L.Control.SideBySide = L.Control.extend({
        options: {
          thumbSize: 42,
          padding: 0
        },
        initialize: function(leftLayers, rightLayers, options) {
          this.setLeftLayers(leftLayers);
          this.setRightLayers(rightLayers);
          L.setOptions(this, options);
        },
        getPosition: function() {
          var rangeValue = this._range.value;
          var offset = (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize);
          return this._map.getSize().x * rangeValue + offset;
        },
        setPosition: noop,
        includes: L.Evented.prototype || L.Mixin.Events,
        addTo: function(map) {
          this.remove();
          this._map = map;
          var container = this._container = L.DomUtil.create("div", "leaflet-sbs", map._controlContainer);
          this._divider = L.DomUtil.create("div", "leaflet-sbs-divider", container);
          var range = this._range = L.DomUtil.create("input", "leaflet-sbs-range", container);
          range.type = "range";
          range.min = 0;
          range.max = 1;
          range.step = "any";
          range.value = 0.5;
          range.style.paddingLeft = range.style.paddingRight = this.options.padding + "px";
          this._addEvents();
          this._updateLayers();
          return this;
        },
        remove: function() {
          if (!this._map) {
            return this;
          }
          if (this._leftLayer) {
            this._leftLayer.getContainer().style.clip = "";
          }
          if (this._rightLayer) {
            this._rightLayer.getContainer().style.clip = "";
          }
          this._removeEvents();
          L.DomUtil.remove(this._container);
          this._map = null;
          return this;
        },
        setLeftLayers: function(leftLayers) {
          this._leftLayers = asArray(leftLayers);
          this._updateLayers();
          return this;
        },
        setRightLayers: function(rightLayers) {
          this._rightLayers = asArray(rightLayers);
          this._updateLayers();
          return this;
        },
        _updateClip: function() {
          var map = this._map;
          var nw = map.containerPointToLayerPoint([0, 0]);
          var se = map.containerPointToLayerPoint(map.getSize());
          var clipX = nw.x + this.getPosition();
          var dividerX = this.getPosition();
          this._divider.style.left = dividerX + "px";
          this.fire("dividermove", { x: dividerX });
          var clipLeft = "rect(" + [nw.y, clipX, se.y, nw.x].join("px,") + "px)";
          var clipRight = "rect(" + [nw.y, se.x, se.y, clipX].join("px,") + "px)";
          if (this._leftLayer) {
            this._leftLayer.getContainer().style.clip = clipLeft;
          }
          if (this._rightLayer) {
            this._rightLayer.getContainer().style.clip = clipRight;
          }
        },
        _updateLayers: function() {
          if (!this._map) {
            return this;
          }
          var prevLeft = this._leftLayer;
          var prevRight = this._rightLayer;
          this._leftLayer = this._rightLayer = null;
          this._leftLayers.forEach(function(layer) {
            if (this._map.hasLayer(layer)) {
              this._leftLayer = layer;
            }
          }, this);
          this._rightLayers.forEach(function(layer) {
            if (this._map.hasLayer(layer)) {
              this._rightLayer = layer;
            }
          }, this);
          if (prevLeft !== this._leftLayer) {
            prevLeft && this.fire("leftlayerremove", { layer: prevLeft });
            this._leftLayer && this.fire("leftlayeradd", { layer: this._leftLayer });
          }
          if (prevRight !== this._rightLayer) {
            prevRight && this.fire("rightlayerremove", { layer: prevRight });
            this._rightLayer && this.fire("rightlayeradd", { layer: this._rightLayer });
          }
          this._updateClip();
        },
        _addEvents: function() {
          var range = this._range;
          var map = this._map;
          if (!map || !range) return;
          map.on("move", this._updateClip, this);
          map.on("layeradd layerremove", this._updateLayers, this);
          L.DomEvent.on(range, getRangeEvent(range), this._updateClip, this);
          L.DomEvent.on(range, "touchstart", cancelMapDrag, this);
          L.DomEvent.on(range, "touchend", uncancelMapDrag, this);
          L.DomEvent.on(range, "mousedown", cancelMapDrag, this);
          L.DomEvent.on(range, "mouseup", uncancelMapDrag, this);
        },
        _removeEvents: function() {
          var range = this._range;
          var map = this._map;
          if (range) {
            L.DomEvent.off(range, getRangeEvent(range), this._updateClip, this);
            L.DomEvent.off(range, "touchstart", cancelMapDrag, this);
            L.DomEvent.off(range, "touchend", uncancelMapDrag, this);
            L.DomEvent.off(range, "mousedown", cancelMapDrag, this);
            L.DomEvent.off(range, "mouseup", uncancelMapDrag, this);
          }
          if (map) {
            map.off("layeradd layerremove", this._updateLayers, this);
            map.off("move", this._updateClip, this);
          }
        }
      });
      L.control.sideBySide = function(leftLayers, rightLayers, options) {
        return new L.Control.SideBySide(leftLayers, rightLayers, options);
      };
      module.exports = L.Control.SideBySide;
    }
  });
  require_index();
})();
