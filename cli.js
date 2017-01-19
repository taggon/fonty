#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const meow = require('meow');
const fonty = require('./');

const cli = meow(`
    Usage
      $ fonty [options] <input> [<output>]

      <input> should be a ttf file.
      <output> is "./build/" by default.

    Options
      -h, --help           shows help
      -g, --glyph          glyphs the output file includes
      -t, --type           comma separated output types. default: ttf,eot,woff,woff2,svg
      -c, --css            generate output CSS file
      -b, --base64         include fonts in output CSS file
      -z, --optimize       optimze output fonts

    Examples
      $ fonty -g "GLYPHS" file.ttf
      $ fonty --glyph="GLYPHS" file.ttf output.ttf
      $ fonty --type="ttf,eot,woff2" file.ttf output.ttf
`, {
	boolean: [
		'base64',
		'css',
		'help',
		'optimize',
	],
	alias: {
		h: 'help',
		g: 'glyph',
		t: 'type',
		b: 'base64',
		c: 'css',
		z: 'optimize',
	}
});

if ( ! cli.input.length || cli.flags.help ) {
	cli.showHelp();
	process.exit();
}

if ( cli.input.length === 1 ) {
	cli.input.push( 'build/' + path.basename( cli.input[0] ) );
}

if ( cli.flags && cli.flags.type ) {
	cli.flags.types = cli.flags.type.split(',');
}

const promises = fonty( cli.input[0], cli.input[1], cli.flags );

process.stdout.write('Fonty - generating font files: ');
promises.map( promise => {
	promise.then( () => process.stdout.write('.') );
} );

Promise.all( promises )
	.then( () => {
		process.stdout.write(' Done\n');
	} )
	.catch( (error) => {
		readline.clearLine(process.stdout, 0);
		readline.cursorTo(process.stdout, 0);
		console.error( error );
		process.exit(1);
	} );
