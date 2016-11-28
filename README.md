# Fonty : A simple library/CLI tool for generating web fonts

* [한국어](docs/README.ko.md)

## Prerequisite

## Usage

```
const fonty = require('fonty');

fonty( 'path/to/source.ttf', 'path/to/output', options );
```

If the `path/to/output` is a directory, it should end with a single forward slash(`/`).

### Options

* `base64`: If true, the `css` option would automatically turn on and the output css would include base64-encoded web fonts.
* `css`: If true, `fonty` would generate css file for the web fonts.
* `glyph`: A string contains the glyphs that the output fonts would have. All glyphs are preserved by defalut.
* `optimize`: If true, all empty glyphs like a space would removed.
* `type`: An array of output types. Default: `['ttf', 'eot', 'svg', 'woff', 'woff2']`.

Note: if the `glyph` option contains a space, fonty will alias it as both new line and carrage return.

### Events

The `fonty` returns an array of promises and a promise represents each type.
See the following code.

```
fonty( 'path/to/source.ttf', 'path/to/output', options ).map( promise => {
	promise.done( (type) => {
		console.log( `.${type} file has been converted.` );
	} );
} );
```

The above code write a console message whenever each file conversion completed.

### CLI Tool

```
$ fonty [options] path/to/source.ttf [path/to/output]
```

Let's say you have a big list of glyphs in `glyphs.txt` and want to generate `eot` and `woff` type webfonts from `font.ttf`.
You can call the glyphs like this:

```
$ text=`cat glyphs.txt` fonty -g="$text" -t="eot,woff" font.ttf
```


## License

This library is released under MIT license.
