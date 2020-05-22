# `.stx` (soundtrail) Web Viewer


This is an open source, publicly available, really basic, .`stx` file viewer.

This version is released as-is as a starting point for the community.
PRs are welcome.

### Information about the `.stx` format

* [The `.stx` format definition](./stxFormatDefinition.md)

* [Article announcing the format](https://medium.com/@medi.muse/introducing-the-new-sound-trail-data-format-66a7d6454efc?source=friends_link&sk=20b65cec44a97735fefd2d6d4bce201e)

* [Article with initial thoughts leading to the concept](https://medium.com/@medi.muse/why-soundtrails-version-2-0-may-be-adopting-kml-as-its-format-for-geospacial-audio-experiences-d74b54b213cb?source=friends_link&sk=b20fd6a7e427348a9d2a6fc858d34a23)

### To view the sample

You can view the sample `.stx` using

```
serve .
```

(install "serve" using `npm i -g serve`)

Then open http://localhost:5000


(or use the `run.bat` included for a python server)


### To try a different `.stx` with this viewer

To try your own `.stx` file in the viewer, add `/?stUrl=[your stx url here]` to the end of the url in your browser.

Or change index.html with your stx file url.

```javascript
   if (soundtrail === null) soundtrail = "[your stx file or url here]";
```


### TODO

* Add polygon support

