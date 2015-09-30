# image-save-server

A simple web server that can save dataURLs to disk

This is useful if you want to generate images using the canvas
api (yes there other ways as well. PhantomJS for example, Electron, node-webkit, canvas-node).

Bascially sometimes I want to generate a bunch of images. Examples:

*   I'm making an image viewer and I want to make sure images are in order even
    though they are loaded out of order.

*   I'm trying to pre-generate a glyph texture atlas

*   I want to take screenshots from some project

## Installing

1.  Install node.js [from here](http://nodejs.org/en/download/).
2.  Download or clone this repo.
3.  cd to the repo and type `npm install`

## Using

type

    node index.js path/to/htmlfiles --dest=output/path

Then open a browser and go to `http://localhost:8080/yourwebpage.html`

In your app generate some image with canvas (2d or webgl) and you can save
it with

    window.saveDataURL(filename, dataURL, callback)

Example:

    window.saveDataURL("myimage.png", someCanvas.toDataURL(), function(err) {
      if (err) {
        alert("wasn't saved");
      } else {
        // was saved
      }
    });

**NOTE:** filenames are only allowed to use a-zA-Z0-9.-_ and space just for securtiy
reasons. I have no idea what all the crazy valid or invalid or weird escape values
are for your OS.

**NOTE:** existing files will be overwritten.

## Example:

There's an example in `example`. Run it with

    mkdir output
    node index.js example --dest=output

Then in your browser to go `http://localhost:8080`. 100 png files
will be generated in the ouput folder each with a random background
gradient and the number of the image [just like these ones](https://github.com/greggman/image-grid/tree/master/test-images/filler).

<img src="https://cdn.rawgit.com/greggman/image-grid/master/test-images/filler/samplefile-13.png" />
<img src="https://cdn.rawgit.com/greggman/image-grid/master/test-images/filler/samplefile-37.png" />
<img src="https://cdn.rawgit.com/greggman/image-grid/master/test-images/filler/samplefile-49.png" />
<img src="https://cdn.rawgit.com/greggman/image-grid/master/test-images/filler/samplefile-74.png" />

## License

MIT


