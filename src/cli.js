#!/usr/bin/env node
'use strict';
import meow from 'meow';
import pwaManifest from 'pwa-manifest';
import inquirer from './pwa-inquirer';
import mapObj from 'map-obj';
import decamelize from 'decamelize';
import sizeof from 'image-size';
import square from 'square-image';
import path from 'path';
import mkdirp from 'mkdirp';
import members from './assets/manifest-members.json';

const cli = meow([`
	Usage
		$ pwa-manifest <manifest path> <icons path> <options>

	Manifest path
		Path for manifest writing. optional, default is the current directory.

	Icons path
		Path for resized icon images. using manifest path if it's not set, or relative path to manifest path

	Options
		--name Name of app [Default: package name or basedir name]
		--short_name Short name of app [Default: package name or basedir name]
		--start_url Start URL [Default: /index.html?homescreen=1]
		--display Display mode [Default: standalone]
		--background_color Background color in CSS color [Default: #FFFFFF]
		--theme_color Theme color in CSS color[Default: #3F51B5]
		--orientation Orientation [Default: natural]
		--direction Base direction [Default: standalone]
		--icons Target image file it will be resized in multiple sizes
		--interactive Creating a manifest in interactive mode [Default: false]

	Examples
		$ pwa-manifest ./app --icons=./logo.png
		$ pwa-manifest ./app ./app/images/icons --icons=./logo.png
		$ pwa-manifest --name='My Progressive Web App' --short='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait --icons=./images/logo.png
		$ pwa-manifest --interactive
`]);

const ask = cli.flags.interactive ? inquirer.ask() : Promise.resolve(
	mapObj(cli.flags, (key, value) => [decamelize(key, '_'), value])
);
const manifestDest = cli.input[0] ? path.resolve(process.cwd(), cli.input[0].replace(/manifest.json$/, '')) : process.cwd();
const iconsDest = cli.input[1] ? path.resolve(process.cwd(), cli.input[1]) : manifestDest;

ask.then(answers => {
	if (answers.icons) {
		let filename = path.resolve(process.cwd(), answers.icons);
		let abspath = path.resolve(manifestDest, iconsDest);
		let dim = sizeof(filename);
		let sizes = {};

		mkdirp.sync(abspath);

		Object.keys(members.icons).forEach(s => {
			if (s <= dim.width) {
				sizes[s] = members.icons[s];
			}
		});

		return square(filename, abspath, sizes).then(icons => {
			answers.icons = mapObj(icons, (icon, p) => {
				p.src = path.join(path.relative(manifestDest, abspath), p.src);
				return [icon, p];
			});
			return answers;
		});
	}

	return answers;
})
.then(answers => pwaManifest(answers))
.then(manifest => {
	pwaManifest.write(manifestDest, manifest);
})
.catch(e => {
	console.error(e.stack);
});
