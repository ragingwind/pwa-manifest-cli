#!/usr/bin/env node

import meow from 'meow';
import pwaManifest from 'pwa-manifest';
import inquirer from './pwa-inquirer';
import mapObj from 'map-obj';
import decamelize from 'decamelize';
import sizeof from 'image-size';
import square from 'square-image';
import path from 'path';
import got from 'got';
import fs from 'fs';
import mkdirp from 'mkdirp';
import rndTmpdir from 'os-random-tmpdir';
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
const filterImageSize = (image, max) => {
	return mapObj(members.icons, (size, icon) => {
		if (size <= max) {
			return [size, icon];
		}
	});
};

const prepareIcon = answers => {
	return new Promise((resolve, reject) => {
		if (!answers.icons) {
			resolve(answers);
		} else if (/^https?/.test(answers.icons)) {
			const url = answers.icons;
			const dir = rndTmpdir('pwa-manifest');

			mkdirp.sync(dir);
			answers.icons = path.join(dir, path.basename(answers.icons));

			got.stream(url).pipe(fs.createWriteStream(answers.icons)
				.on('finish', () => resolve(answers))
				.on('error', () => reject())
			);
		} else {
			answers.icons = path.resolve(process.cwd(), answers.icons);
			resolve(answers);
		}
	});
};

const squareIcon = answers => {
	if (answers.icons) {
		let filename = answers.icons;
		let abspath = path.resolve(manifestDest, iconsDest);
		let size = sizeof(filename);

		mkdirp.sync(abspath);

		// resize images by preset
		return square(filename, abspath, filterImageSize(filename, size.width)).then(icons => {
			answers.icons = [];
			mapObj(icons, (icon, p) => {
				p.src = path.join(path.relative(manifestDest, abspath), p.src);
				answers.icons.push(p);
				return [icon, p];
			});
			return answers;
		});
	}

	return answers;
};

ask.then(prepareIcon)
	.then(squareIcon)
	.then(pwaManifest)
	.then(manifest => {
		pwaManifest.write(manifestDest, manifest);
	})
	.catch(e => {
		console.error(e.stack);
	});
