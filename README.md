# `.stx` (soundtrail) Web Viewer


This is an open source, publicly available, really basic, .`stx` file viewer.

This version is released as-is as a starting point for the community.
PRs are welcome.

### Information about the `.stx` format

* [The `.stx` format definition](./stxFormatDefinition.md)

* [Article announcing the format](https://medium.com/@medi.muse/introducing-the-new-sound-trail-data-format-66a7d6454efc?source=friends_link&sk=20b65cec44a97735fefd2d6d4bce201e)

* [Article with initial thoughts leading to the concept](https://medium.com/@medi.muse/introducing-the-new-sound-trail-data-format-66a7d6454efc?source=friends_link&sk=20b65cec44a97735fefd2d6d4bce201e)

### To view the sample

You can view the sample `.stx` using

```
serve .
```

(install "serve" using `npm i -g serve`)

Then open http://localhost:5000


(or use the `run.bat` included for a python server)


### To try a different `.stx` with this viewer

To try your own `.stx` file in the viewer, currently you must simply change the line in `index.html` which is currently 

```
const soundtrail = "./zip/Nambour.stx"
```

to the URL of your own .stx file.


### TODO

* Need to remove soundtrails.com hardcoding
* Allow upload and viewing of an arbitrary `.stx` file    
   (or, at a minimum, add it as URL param)
* Add polygon support
* Multiple image support 

