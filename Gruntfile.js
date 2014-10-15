'use strict'

var grunt = require('grunt');
require('string.fromcodepoint');

function uStr(str) {
	var ex = str.split('-');
	var hex = ex.map(function(x) {
		return parseInt(x, 16);
	});
	return String.fromCodePoint.apply(this, hex);
}

grunt.registerTask('pidgin', 'Generate Emoji One theme file', function() {
	var opts  = this.options({
		dest: './dist/theme',
	});
	var emoji = require('emojione/emoji');
	var theme = {
		name:   'Emoji One',
		desc:   'Emoji One unicode ported to Pidgin',
		icon:   '1F40C.png',
		author: 'Niclas Hoyer',
		repl: []
	}
	Object.keys(emoji).forEach(function(k) {
		var e = emoji[k];
		var alias = []
		alias.push(e.unicode + '.png');
		alias.push(uStr(e.unicode));
		//alias = alias.concat(e.unicode_alternates.map(uStr));
		alias.push(e.shortname);
		alias = alias.concat(e.aliases);
		alias = alias.concat(e.aliases_ascii);
		theme.repl.push(alias);
	});
	theme.repl = theme.repl.map(function(x) {
		return x.join('\t');
	});
	var themestr = '';
	themestr += 'Name=' + theme.name + '\n';
	themestr += 'Description=' + theme.desc + '\n';
	themestr += 'Icon=' + theme.icon + '\n';
	themestr += 'Author=' + theme.author + '\n';
	themestr += '\n[default]\n'
	themestr += theme.repl.join('\n');
	grunt.file.write(opts.dest, themestr);
});

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-compress');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-pngmin');
grunt.loadNpmTasks('grunt-multiresize');

grunt.registerTask('default', [
	'clean:all',
	'multiresize',
	'pngmin',
	'pidgin',
	'copy',
	'compress',
	'clean:build']
);

grunt.initConfig({
	clean: {
		build: ['./dist/*.png', './dist/theme', './dist/*.md'],
		all: ['./dist']
	},
	copy: {
		readme: {
			files: [{
				src: ['./README.md'],
				dest: './dist/'
			}]
		},
		license: {
			files: [{
				src: ['./LICENSE.md'],
				dest: './dist/'
			}]
		}
	},
	multiresize: {
		options: {
			destSizes: ['24x24']
		},
		png: {
			files: [{
				expand: true,
				src: ['./node_modules/emojione/assets/png/*'],
				dest: './dist/',
				ext: '.png',
				flatten: true,
				destSizes: ['24x24']
			}],
		}
	},
	pngmin: {
		options: {
			ext: '.png',
			force: true,
			quality: {
				min: 90,
				max: 100
			}
		},
		png: {
			files: [{
				expand: true,
				src:  ['./dist/*.png'],
			}]
		}
	},
	compress: {
		options: {
			mode: 'tgz',
			archive: './dist/pidgin-emojione.tar.gz'
		},
		theme: {
			files: [{
				expand: true,
				src:  ['./dist/*'],
				flatten: true,
				dest: './emojione/'
			}]
		}
	}
});
