# leaflet-side-by-side

A Leaflet control to add a split screen to compare two map overlays.

![screencast example](screencast.gif)

### L.Control.sideBySide(_leftLayer[s]_, _rightLayer[s]_)

Creates a new Leaflet Control for comparing two layers or collections of layers. It does not add the layers to the map - you need to do that manually. Extends `L.Control` but `setPosition()` and `getPosition` are `noop` because the position is always the same - it does not make sense for this control to be in the corner like other Leaflet controls.

### Parameters

| parameter                     | type           | description                                                                                           |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `leftLayers`  | L.Layer\|array | A Leaflet Layer or array of layers to show on the left side of the map. Any layers in this array that are added to the map will be shown on the left |
| `rightLayers` | L.Layer\|array | A Leaflet Layer or array of layers to show on the right side of the map. Any layers in this array that are added to the map will be shown on the right. These *should not be the same as any layers in `leftLayers`* |

### Usage

Add the script to the top of your page (css is included in the javascript):

```html
<script src="leaflet-side-by-side.js"></script>
```

Or if you are using browserify:

```js
var sideBySide = require('leaflet-side-by-side')
```

Then create a map, add two layers to it, and create the SideBySide control and add it to the map:

```js
var map = L.map('map').setView([51.505, -0.09], 13);

var myLayer1 = L.tileLayer(...).addTo(map);

var myLayer2 = L.tileLayer(...).addTo(map)

L.Control.sideBySide(myLayer1, myLayer2).addTo(map);
```

### Example

[Live Example](http://lab.digital-democracy.org/leaflet-side-by-side/) see [source](index.html)

### License

MIT
