const fs = require('fs');
const path = require('path');
const base64 = require('base64-js');

module.exports = function( opts ) {
	const base64Data = {};
	const css = [];
	const src = [];

	if ( opts.base64 ) {
		Object.keys( opts.data ).forEach( type => {
			base64Data[ type ] = base64.fromByteArray( opts.data[ type ] );
		} );
	} else {
		src.push( `local("${opts.fontFamily}")` );
	}

	css.push( '@font-face {' );
	css.push( `\tfont-family: "${opts.fontFamily}";`);

	if ( opts.data.eot && ! opts.base64 ) {
		css.push( `\tsrc: url("${opts.basename}.eot");` );
	}

	[ 'eot', 'woff2', 'woff', 'ttf', 'svg' ].forEach( type => {
		if ( ! opts.data[ type ] ) return;

		let format = type;
		let svgPostfix = '';

		if ( type === 'ttf' ) {
			format = 'truetype';
		} else if ( type === 'eot') {
			format = 'embedded-opentype';
		} else if ( type === 'svg' ) {
			svgPostfix = '#' + opts.fontFamily;
		}

		src.push(
			opts.base64 ?
				`url(data:application/x-font-${format};base64,${base64Data[ type ]}${svgPostfix}) format("${format}")` :
				`url("${opts.basename}.${type}${svgPostfix}") format("${format}")`
		);
	} );

	css.push( `\tsrc: ${src.join(',\n\t')};` );
	css.push( '\tfont-style: normal;' );
	css.push( '\tfont-weight: normal;' );
	css.push( '}' );


	fs.writeFile( opts.filename, css.join( '\n' ), () => {
		console.log( `${opts.basename}.css has been generated.` );
	} );
};
