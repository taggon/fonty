const fs = require('fs');
const path = require('path');
const Font = require('fonteditor-core').Font;
const TTF = require('fonteditor-core').TTF;
const ttf2woff2 = require('ttf2woff2');
const cssWriter = require('./css-writer');
const deflate = require('pako').deflate;

const allowedOutputTypes = [ 'ttf', 'eot', 'svg', 'woff', 'woff2' ];

function exists(path) {
	try {
		fs.accessSync(path);
		return true;
	} catch(e) {
		return false;
	}
}

function normalizeOptions(options) {
	const result = {
		css: options.css,
		base64: options.base64,
	};

	if ( result.base64 ) {
		result.css = true;
	}

	result.types = (options.types || []).filter( item => allowedOutputTypes.indexOf(item) !== -1 );
	if ( result.types.length === 0 ) {
		result.types = allowedOutputTypes.concat();
	}

	if ( options.glyph ) {
		result.subset = [];
		for ( let i=0; i < options.glyph.length; i++ ) {
			result.subset.push( options.glyph.charCodeAt(i) );
		}
	}

	return result;
}

function write(dir, basename, ext, data) {
	return new Promise( (resolve, reject) => {
		const filePath = path.join( dir, `${basename}.${ext}` );

		fs.writeFile( filePath, data, ( error ) => {
			if ( error ) {
				reject( error );
			} else {
				resolve( ext );
			}
		} );
	} );
}

module.exports = function( input, output, options ) {
	// file exists?
	if ( !exists(input) ) {
		return [ Promise.reject( `Input file ${input} doesn't exist.` ) ];
	}

	const ttfOptions = {
		type: 'ttf',
		hinting: true,
		compound2simple: true,
		inflate: null,
		combinePath: false,
	};

	const opts = normalizeOptions(options);
	if ( opts.subset ) {
		ttfOptions.subset = opts.subset;
	}

	const buffer = fs.readFileSync( input );
	const font = Font.create( buffer, ttfOptions );

	// alias empty space glyphs
	// If a font file doesn't include these empty glyphs, MS IE/Edge would display unknown .
	let space = null;
	const ttf = new TTF(font.get());

	if ( opts.subset ) {
		const spaceIndex = ttf.getGlyfIndexByCode(32);
		if ( spaceIndex !== -1 ) {
			space = ttf.getGlyfByIndex(spaceIndex);
			if ( space && space.unicode && space.unicode.indexOf(32) !== -1 ) {
				space.contours = [];

				[ 10, 13 ].forEach( code => {
					if ( space.unicode.indexOf(code) === -1 ) {
						space.unicode.push(code);
					}
				} );

				ttf.replaceGlyf(space, spaceIndex);
			} else {
				space = null;
			}
		}
	}

	if ( opts.optimize ) {
		ttf.optimize();

		if ( space ) {
			ttf.addGlyf( space );
		}
	}

	font.set( ttf.get() );
	font.compound2simple();
	font.sort();

	// create dir
	const dir = path.dirname( output );
	if ( dir !== '.' && ! exists( dir ) ) {
		fs.mkdirSync( dir );
	}

	// outputs
	const ext = path.extname( output );
	const basename = path.basename( output, ext );
	const result = {};
	const promises = opts.types.map( ( type ) => {
		let output = null;

		if ( type === 'woff2' ) {
			output = ttf2woff2( font.write( { type: 'ttf', hinting: true } ) );
		} else {
			output = font.write( { type, hinting: true, deflate: deflate } );
		}

		return write( dir, basename, type, result[ type ] = output );
	} );

	// generate css
	if ( opts.css ) {
		cssWriter( {
			filename: path.join( dir, basename + '.css' ),
			basename: basename,
			fontFamily: font.get().name.fontFamily,
			data: result,
			base64: opts.base64,
		} );
	}

	return promises;
};
