# `.stx` File Format Definition

An `.stx` file is a subset of a [`.kml` file](https://developers.google.com/kml/documentation/kml_tut#basic_kml), with some additional extensions.

A `.stx` file can be loaded into software that can view a `.kml` without error (although not all the sound trail functionality will work).

### `<Document>`

All properties **MUST** be inside of a `<Document>` tag.

(We are looking at having a custom XLS)


### Supported propeties

Only a subset of the available KML properties are supported by a `.stx` file.


Soundfields can be represented in a `.stx` file as either **polygons** or **circles**.


##### Polygons

```xml
<Placemark id="1">
    <Polygon>
        <outerBoundaryIs>
            <LinearRing>
            <coordinates>
                152.84486,-26.758348 152.84604,-26.758348 152.84604,-26.757237 152.84486,-26.757237 152.84486,-26.758348
            </coordinates>
            </LinearRing>
        </outerBoundaryIs>
    </Polygon>
</Placemark>
```

##### Circles

A circle is a point, with an ExtendedData Data attribute to represent the radius.

```xml
<Placemark id="2">
    <Point>
        <coordinates>152.849538,-26.758128</coordinates>
    </Point>
    <ExtendedData>
        <Data name="radius">
            <value>104</radius>
        </Data>
    </ExtendedData>
</Placemark>
```



### Additional extension

The `ExtendedData` tag is used to include the soundtrail specific information, which allows cross compatability with standard KML files.

Using the namespace `http://soundtrails.com.au/soundtrailformat/1.0.0/soundtrail.xsd` allows soundtrail specific XML tags.

#### Inside of `<Document>`

The available tags are :
* **title**
* **desc**
* **imageBaseUrl**
* **audioBaseUrl**
* **images**
* **mapTilesUrl**  (This is a URL to a `.mbtiles` file to be used for displaying the map) OR
* **mapImageOverlayUrl**  (An option image to use for overlaying)
* **mapImageBounds** (A geo pair required if mapImageOverlayUrl is set)
* **author** (warning if not present)
* **copyright** (warning if not present)

For example : 

```xml
<ExtendedData>
    <Data name="title">
        <value>Nambour Sound Walk</value>
    </Data>
    <Data name="desc">
        <value>Drawing together history and heritage, local stories and great original music, the Nambour Heritage Soundtrail is a contemporary take on a truly historical town.</value>
    </Data>
    <Data name="imageBaseUrl">
        <value>https://soundtrails.com.au/soundwalks/datafiles/images/</value>
    </Data>
    <Data name="images">
        <value>soundwalk_image_596457907caef, soundwalk_image_596457b1a0841, soundwalk_image_596457d396bce,
        soundwalk_image_59645808f1741, soundwalk_image_596458482974e, hotspot_image_59768cde8e57d</value>
    </Data>
</ExtendedData>
```

#### Inside of `<Placemark>`

* **radius** 
  *(for a circle)*
* **title**
* **desc**
* **transcript** 
  *(text of the audio file, for hearing impared)*
* **audioFileUrl**  *(full URL path, or name relative to `audioBaseUrl`)*
* **audioLayer**
*(higher layer audio will play over the top of lower)* 
(def: 10)
* **areaDisplayStyle**
*(if this area is visible on a map, & how displayed ('area', 'none', 'pin', 'alert'))* 
(def: 'area')
* **audioPlayerVisible** 
*(BOOL - show the audio player show for this audio)*
(def: true)
* **audioLoop**
*(BOOL - audio should start again at the beginning after finishing)*
(def: false)
* **audioPlayUntilEnd**
*(BOOL - should audio play until the end even if leaving triggger zone)*
(def: fase)
* **audioContinueOnReEntry**
*(BOOL - should the audio continue where it left off when re-entering the area)*
(def: true)
* **audioOnlyPlayOnce**
*(BOOL - if audio has finished, it should not start again on re-entry to this area - the Soundtrail must be RESET to adjust this - manual play is not effected by this flag)*
* **images** 
    *(a comma separated list of image file names or full URLS)*

For example : 

```xml
<Placemark id="336">
    <Point>
        <coordinates>152.9598328471183800,-26.6269910082151250</coordinates>
    </Point>
    <ExtendedData>
        <Data name="radius">
            <value>150</value>
        </Data>
        <Data name="audioFileUrl">
            <value>https://soundtrails.com.au/soundwalks/datafiles/sounds/sound_file_595082f26d231.mp3</value>
        </Data>
        <Data name="title">
            <value>Howard St and the Cane Train Haul</value>
        </Data>
        <Data name="desc">
            <value>Memories of the trains that went past and the chaos that sometime ensued.</value>
        </Data>
        <Data name="images">
            <value>hotspot_images_5959a829a004b, hotspot_images_5964336951ee9</value>
        </Data>
    </ExtendedData>
</Placemark>
```

## Full Sample 

**[Sample.stx](./samples//Nambour.stx)**

## XSD

XSD (XML Schema Definition) is a World Wide Web Consortium (W3C) recommendation that specifies how to formally describe the elements in an Extensible Markup Language (XML) document. This description can be used to verify that each item of content in a document adheres to the description of the element in which the content is to be placed.

I generated an XSD for `.soundtrail` files using https://www.freeformatter.com/xsd-generator.html and with the Sample.soundtrail (and a poly added) as an input.

Here is the XSD for `.stx` files : **[soundtrail.v1.xsd](./soundtrail.v1.xsd)**
