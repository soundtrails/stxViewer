/*!
	Copyright (c) 2011-2015, Pavel Shramov, Bruno Bergot - MIT licence
*/

function get_nextsibling(n) {
    if (n === null) { return; }
    var x = n.nextSibling;
    while (x.nodeType != 1) {
        x = x.nextSibling;
    }
    return x;
}

L.KML = L.FeatureGroup.extend({

    initialize: function (kml) {
        this._kml = kml;
        this._layers = {};

        if (kml) {
            this.addKML(kml);
        }
    },

    addKML: function (xml) {
        var layers = L.KML.parseKML(xml);
        if (!layers || !layers.length) return;
        for (var i = 0; i < layers.length; i++) {
            this.fire('addlayer', {
                layer: layers[i],
            });
            this.addLayer(layers[i]);
        }
        this.latLngs = L.KML.getLatLngs(xml);
        this.fire('loaded');
    },

    latLngs: []
});

L.Util.extend(L.KML, {

    parseKML: function (xml) {
        var style = this.parseStyles(xml);
        this.parseStyleMap(xml, style);
        var el = xml.getElementsByTagName('Folder');
        var layers = [], l;
        for (var i = 0; i < el.length; i++) {
            if (!this._check_folder(el[i])) { continue; }
            l = this.parseFolder(el[i], style);
            if (l) { layers.push(l); }
        }
        el = xml.getElementsByTagName('Placemark');
        for (var j = 0; j < el.length; j++) {
            if (!this._check_folder(el[j])) { continue; }
            l = this.parsePlacemark(el[j], xml, style);
            if (l) { layers.push(l); }
        }
        el = xml.getElementsByTagName('Data');
        for (var j = 0; j < el.length; j++) {
            if (!this._check_folder(el[j])) { continue; }
            l = this.parseData(el[j], xml, style);
            if (l) { layers.push(l); }
        }
        el = xml.getElementsByTagName('GroundOverlay');
        for (var k = 0; k < el.length; k++) {
            l = this.parseGroundOverlay(el[k]);
            if (l) { layers.push(l); }
        }
        return layers;
    },

    // Return false if e's first parent Folder is not [folder]
    // - returns true if no parent Folders
    _check_folder: function (e, folder) {
        e = e.parentNode;
        while (e && e.tagName !== 'Folder') {
            e = e.parentNode;
        }
        return !e || e === folder;
    },

    parseStyles: function (xml) {
        var styles = {};
        var sl = xml.getElementsByTagName('Style');
        for (var i = 0, len = sl.length; i < len; i++) {
            var style = this.parseStyle(sl[i]);
            if (style) {
                var styleName = '#' + style.id;
                styles[styleName] = style;
            }
        }
        return styles;
    },

    parseStyle: function (xml) {
        var style = {}, poptions = {}, ioptions = {}, el, id;

        var attributes = { color: true, width: true, Icon: true, href: true, hotSpot: true };

        function _parse(xml) {
            var options = {};
            for (var i = 0; i < xml.childNodes.length; i++) {
                var e = xml.childNodes[i];
                var key = e.tagName;
                if (!attributes[key]) { continue; }
                if (key === 'hotSpot') {
                    for (var j = 0; j < e.attributes.length; j++) {
                        options[e.attributes[j].name] = e.attributes[j].nodeValue;
                    }
                } else {
                    var value = e.childNodes[0].nodeValue;
                    if (key === 'color') {
                        options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
                        options.color = '#' + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
                    } else if (key === 'width') {
                        options.weight = parseInt(value);
                    } else if (key === 'Icon') {
                        ioptions = _parse(e);
                        if (ioptions.href) { options.href = ioptions.href; }
                    } else if (key === 'href') {
                        options.href = value;
                    }
                }
            }
            return options;
        }

        el = xml.getElementsByTagName('LineStyle');
        if (el && el[0]) { style = _parse(el[0]); }
        el = xml.getElementsByTagName('PolyStyle');
        if (el && el[0]) { poptions = _parse(el[0]); }
        if (poptions.color) { style.fillColor = poptions.color; }
        if (poptions.opacity) { style.fillOpacity = poptions.opacity; }
        el = xml.getElementsByTagName('IconStyle');
        if (el && el[0]) { ioptions = _parse(el[0]); }
        if (ioptions.href) {
            style.icon = new L.KMLIcon({
                iconUrl: ioptions.href,
                shadowUrl: null,
                anchorRef: { x: ioptions.x, y: ioptions.y },
                anchorType: { x: ioptions.xunits, y: ioptions.yunits }
            });
        }

        id = xml.getAttribute('id');
        if (id && style) {
            style.id = id;
        }

        return style;
    },

    parseStyleMap: function (xml, existingStyles) {
        var sl = xml.getElementsByTagName('StyleMap');

        for (var i = 0; i < sl.length; i++) {
            var e = sl[i], el;
            var smKey, smStyleUrl;

            el = e.getElementsByTagName('key');
            if (el && el[0]) { smKey = el[0].textContent; }
            el = e.getElementsByTagName('styleUrl');
            if (el && el[0]) { smStyleUrl = el[0].textContent; }

            if (smKey === 'normal') {
                existingStyles['#' + e.getAttribute('id')] = existingStyles[smStyleUrl];
            }
        }

        return;
    },

    parseFolder: function (xml, style) {
        var el, layers = [], l;
        el = xml.getElementsByTagName('Folder');
        for (var i = 0; i < el.length; i++) {
            if (!this._check_folder(el[i], xml)) { continue; }
            l = this.parseFolder(el[i], style);
            if (l) { layers.push(l); }
        }
        el = xml.getElementsByTagName('Placemark');
        for (var j = 0; j < el.length; j++) {
            if (!this._check_folder(el[j], xml)) { continue; }
            l = this.parsePlacemark(el[j], xml, style);
            if (l) { layers.push(l); }
        }
        el = xml.getElementsByTagName('GroundOverlay');
        for (var k = 0; k < el.length; k++) {
            if (!this._check_folder(el[k], xml)) { continue; }
            l = this.parseGroundOverlay(el[k]);
            if (l) { layers.push(l); }
        }
        if (!layers.length) { return; }
        if (layers.length === 1) { return layers[0]; }
        return new L.FeatureGroup(layers);
    },

    parsePlacemark: function (place, xml, style, options) {
        var h, i, j, k, el, il, opts = options || {};

        el = place.getElementsByTagName('styleUrl');
        for (i = 0; i < el.length; i++) {
            var url = el[i].childNodes[0].nodeValue;
            for (var a in style[url]) {
                opts[a] = style[url][a];
            }
        }

        il = place.getElementsByTagName('Style')[0];
        if (il) {
            var inlineStyle = this.parseStyle(place);
            if (inlineStyle) {
                for (k in inlineStyle) {
                    opts[k] = inlineStyle[k];
                }
            }
        }

        var multi = ['MultiGeometry', 'MultiTrack', 'gx:MultiTrack'];
        for (h in multi) {
            el = place.getElementsByTagName(multi[h]);
            for (i = 0; i < el.length; i++) {
                var layer = this.parsePlacemark(el[i], xml, style, opts);
                this.addPlacePopup(place, layer);
                return layer;
            }
        }

        var layers = [];

        var parse = ['LineString', 'Polygon', 'Point', 'Track', 'gx:Track'];
        for (j in parse) {
            var tag = parse[j];

            el = place.getElementsByTagName(tag);
            for (i = 0; i < el.length; i++) {
                var l = this['parse' + tag.replace(/gx:/, '')](el[i], xml, opts);
                if (l) { layers.push(l); }
            }
        }

        if (!layers.length) {
            return;
        }
        var layer = layers[0];
        if (layers.length > 1) {
            layer = new L.FeatureGroup(layers);
        }

        this.addPlacePopup(place, layer);
        return layer;
    },

    addPlacePopup: function (place, layer) {
        var i, j, name, descr = '';
        el = place.getElementsByTagName('name');
        if (el.length && el[0].childNodes.length) {
            name = el[0].childNodes[0].nodeValue;
        }
        el = place.getElementsByTagName('description');
        for (i = 0; i < el.length; i++) {
            for (j = 0; j < el[i].childNodes.length; j++) {
                descr = descr + el[i].childNodes[j].nodeValue;
            }
        }

        if (name) {
            layer.bindPopup('<h2>' + name + '</h2>' + descr, { className: 'kml-popup' });
        }
    },

    parseCoords: function (xml) {
        var el = xml.getElementsByTagName('coordinates');
        return this._read_coords(el[0]);
    },

    parseLineString: function (line, xml, options) {
        var coords = this.parseCoords(line);
        if (!coords.length) { return; }
        return new L.Polyline(coords, options);
    },

    parseTrack: function (line, xml, options) {
        var el = xml.getElementsByTagName('gx:coord');
        if (el.length === 0) { el = xml.getElementsByTagName('coord'); }
        var coords = [];
        for (var j = 0; j < el.length; j++) {
            coords = coords.concat(this._read_gxcoords(el[j]));
        }
        if (!coords.length) { return; }
        return new L.Polyline(coords, options);
    },

    parseData: function (line, xml, options) {
        var el = line.getElementsByTagName('value');
        if (!el.length) {
            return;
        }
        if (line.attributes[0].value === "mapImageOverlayUrl") {
            var imgurl;
            xml.getElementsByTagName('ExtendedData')[0].childNodes.forEach((node) => {
                if (node.nodeName != "#text") {
                    if (node.getAttribute("name") === "imageBaseUrl") {
                        imgurl = node.textContent.trim();
                    }
                }
            });
            b = get_nextsibling(line).getElementsByTagName('value')[0].textContent.trim().split(" ")
            const nw = b[0].split(",")
            const se = b[1].split(",")
            const bounds = [[nw[1], nw[0]], [se[1], se[0]]]
            const image = imgurl + el[0].textContent
            L.imageOverlay(image, bounds, {
                opacity: 1
            }).addTo(map);
        }
    },


    getDataAttributeValue(extendedData, property) {
        try {
            var data = extendedData.getElementsByTagName("Data");
            var elem = [...data].filter((e) => e.attributes.getNamedItem('name').value == property);
            var valu = elem[0].children[0].innerHTML;
            return valu;
        } catch (e) {
            console.warn(`Parsing for ${property} failed in`, extendedData, e);
            return null;
        }
    },

    parsePoint: function (line, xml, options) {
        var el = line.getElementsByTagName('coordinates');
        if (!el.length) {
            return;
        }
        const ed = get_nextsibling(line).getElementsByTagName('value');

        //////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        const r = parseFloat(ed[0].childNodes[0].nodeValue);

        var imgurl, soundUrl;

        xml.getElementsByTagName('ExtendedData')[0].childNodes.forEach((node) => {
            if (node.nodeName != "#text") {
                if (node.getAttribute("name") === "audioBaseUrl") {
                    soundUrl = node.textContent.trim();
                }
                if (node.getAttribute("name") === "imageBaseUrl") {
                    imgurl = node.textContent.trim();
                }
            }
        });
        var ll = el[0].childNodes[0].nodeValue.split(',');
        options = { radius: r }
        const m = new L.marker(new L.LatLng(ll[1], ll[0]), options);
        // TODO - THIS SHOULD NOT BE HARDCODED TO [4] - INSTEAD LOOK UP BASED ON PROPERTY
        // SEE THE LOGIC FOR GETTING THE "layer" property below - CHANGE _ALL_ HARDCODING TO WORK LIKE THIS
        var img = ed[4].childNodes[0];

        // For now, check the "layer" property, and disply if > 5
        // However this should probably be based upon "areaDisplayStyle" if that is being set in the files
        var layer = this.getDataAttributeValue(get_nextsibling(line), 'layer');

        // change these as needed --- get this from the Document values, but also allow BOTH file name AND full path URLS -- TODO
        //if (img != undefined) {
        if (layer >= 5) {
            displayImages = ""
            if (img != undefined) {
                img = img.nodeValue
                img = "" + img
                if (img.includes(',')) {
                    displayImages = '<div class="slider" id="slider">'
                    var images = img.split(',')
                    images.forEach(image => {
                        displayImages += '<div><img style="width:400px; height:auto" src="' + imgurl + image + '" /></div>';
                    });
                    displayImages += '</div>'
                } else {
                    displayImages = '<img style="width:400px; height:auto" src="' + imgurl + img + '" />'
                }
            }
            // this is for the soundtrail website, you're gonna need to add you're own urls and stuff here
            m.bindPopup('<div style="width:400px; height:400px;">' +
                '<h3>' + ed[2].childNodes[0].nodeValue + '</h3>' +
                displayImages +
                '<br>' +
                ed[3].childNodes[0].nodeValue +
                '<br>' +
                '<audio controls controlsList="nodownload" style="width:400px">' +
                '<source src="' + soundUrl + ed[1].childNodes[0].nodeValue + '" type="audio/mp3">' +
                '</source></audio></div>');
        }
        if (ed[6].childNodes[0].nodeValue != "none") {
            return m;
        }
    },

    parsePolygon: function (line, xml, options) {
        var el, polys = [], inner = [], i, coords;
        el = line.getElementsByTagName('outerBoundaryIs');
        for (i = 0; i < el.length; i++) {
            coords = this.parseCoords(el[i]);
            if (coords) {
                polys.push(coords);
            }
        }
        el = line.getElementsByTagName('innerBoundaryIs');
        for (i = 0; i < el.length; i++) {
            coords = this.parseCoords(el[i]);
            if (coords) {
                inner.push(coords);
            }
        }
        if (!polys.length) {
            return;
        }
        if (options.fillColor) {
            options.fill = true;
        }
        if (polys.length === 1) {
            return new L.Polygon(polys.concat(inner), options);
        }
        return new L.MultiPolygon(polys, options);
    },

    getLatLngs: function (xml) {
        var el = xml.getElementsByTagName('coordinates');
        var coords = [];
        for (var j = 0; j < el.length; j++) {
            // text might span many childNodes
            coords = coords.concat(this._read_coords(el[j]));
        }
        return coords;
    },

    _read_coords: function (el) {
        var text = '', coords = [], i;
        for (i = 0; i < el.childNodes.length; i++) {
            text = text + el.childNodes[i].nodeValue;
        }
        text = text.split(/[\s\n]+/);
        for (i = 0; i < text.length; i++) {
            var ll = text[i].split(',');
            if (ll.length < 2) {
                continue;
            }
            coords.push(new L.LatLng(ll[1], ll[0]));
        }
        return coords;
    },

    _read_gxcoords: function (el) {
        var text = '', coords = [];
        text = el.firstChild.nodeValue.split(' ');
        coords.push(new L.LatLng(text[1], text[0]));
        return coords;
    },

    parseGroundOverlay: function (xml) {
        var latlonbox = xml.getElementsByTagName('LatLonBox')[0];
        var bounds = new L.LatLngBounds(
            [
                latlonbox.getElementsByTagName('south')[0].childNodes[0].nodeValue,
                latlonbox.getElementsByTagName('west')[0].childNodes[0].nodeValue
            ],
            [
                latlonbox.getElementsByTagName('north')[0].childNodes[0].nodeValue,
                latlonbox.getElementsByTagName('east')[0].childNodes[0].nodeValue
            ]
        );
        var attributes = { Icon: true, href: true, color: true };
        function _parse(xml) {
            var options = {}, ioptions = {};
            for (var i = 0; i < xml.childNodes.length; i++) {
                var e = xml.childNodes[i];
                var key = e.tagName;
                if (!attributes[key]) { continue; }
                var value = e.childNodes[0].nodeValue;
                if (key === 'Icon') {
                    ioptions = _parse(e);
                    if (ioptions.href) { options.href = ioptions.href; }
                } else if (key === 'href') {
                    options.href = value;
                } else if (key === 'color') {
                    options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
                    options.color = '#' + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
                }
            }
            return options;
        }
        var options = {};
        options = _parse(xml);
        if (latlonbox.getElementsByTagName('rotation')[0] !== undefined) {
            var rotation = latlonbox.getElementsByTagName('rotation')[0].childNodes[0].nodeValue;
            options.rotation = parseFloat(rotation);
        }
        return new L.RotatedImageOverlay(options.href, bounds, { opacity: options.opacity, angle: options.rotation });
    }

});

L.KMLIcon = L.Icon.extend({
    options: {
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    },
    _setIconStyles: function (img, name) {
        L.Icon.prototype._setIconStyles.apply(this, [img, name]);
        if (img.complete) {
            this.applyCustomStyles(img)
        } else {
            img.onload = this.applyCustomStyles.bind(this, img)
        }

    },
    applyCustomStyles: function (img) {
        var options = this.options;
        var width = options.iconSize[0];
        var height = options.iconSize[1];

        this.options.popupAnchor = [0, (-0.83 * height)];
        if (options.anchorType.x === 'fraction')
            img.style.marginLeft = (-options.anchorRef.x * width) + 'px';
        if (options.anchorType.y === 'fraction')
            img.style.marginTop = ((-(1 - options.anchorRef.y) * height) + 1) + 'px';
        if (options.anchorType.x === 'pixels')
            img.style.marginLeft = (-options.anchorRef.x) + 'px';
        if (options.anchorType.y === 'pixels')
            img.style.marginTop = (options.anchorRef.y - height + 1) + 'px';
    }
});


L.KMLMarker = L.Circle.extend({});

// Inspired by https://github.com/bbecquet/Leaflet.PolylineDecorator/tree/master/src
L.RotatedImageOverlay = L.ImageOverlay.extend({
    options: {
        angle: 0
    },
    _reset: function () {
        L.ImageOverlay.prototype._reset.call(this);
        this._rotate();
    },
    _animateZoom: function (e) {
        L.ImageOverlay.prototype._animateZoom.call(this, e);
        this._rotate();
    },
    _rotate: function () {
        if (L.DomUtil.TRANSFORM) {
            // use the CSS transform rule if available
            this._image.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
        } else if (L.Browser.ie) {
            // fallback for IE6, IE7, IE8
            var rad = this.options.angle * (Math.PI / 180),
                costheta = Math.cos(rad),
                sintheta = Math.sin(rad);
            this._image.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
        }
    },
    getBounds: function () {
        return this._bounds;
    }
});
