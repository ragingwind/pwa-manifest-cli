#!/usr/bin/env node

import 'babel-polyfill';
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
import toIco from 'to-ico';
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
		$ pwa-manifest --name='My Progressive Web App' --short_name='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait --icons=./images/logo.png
		$ pwa-manifest --interactive
`]);

// set manifest destination
const manifestDest = cli.input[0] ? path.resolve(process.cwd(), cli.input[0].replace(/manifest.json$/, '')) : process.cwd();

// set icons destination
const iconsDest = cli.input[1] ? path.resolve(process.cwd(), cli.input[1]) : manifestDest;

// determine interactive mode or not
const ask = cli.flags.interactive ? inquirer.ask() : Promise.resolve(
	mapObj(cli.flags, (key, value) => [decamelize(key, '_'), value])
);

// fiter image by size
const filterImageSize = max => {
	return mapObj(members.icons, (size, icon) => {
		if (size <= max) {
			return [size, icon];
		}
	});
};

// prepare icons it can be from online and local
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

const writeFavico = (src, dest) => {
	return new Promise((resolve, reject) => {
		fs.readFile(src, (err, image) => {
			if (err) {
				reject(new Error('Failed to generate favicon'));
				return;
			}

			toIco(image).then(buf => {
				fs.writeFile(path.join(dest, 'favicon.ico'), buf, err => {
					if (err) {
						reject(new Error('Failed to generate favicon'));
						return;
					}

					resolve();
				});
			});
		});
	});
};

// resize icons in square shape
const squareIcons = answers => {
	return new Promise(resolve => {
		if (!answers.icons) {
			resolve(answers);
			return;
		}

		let filename = answers.icons;
		let abspath = path.resolve(manifestDest, iconsDest);
		let size = sizeof(filename);

		mkdirp(abspath, () => {
			// resize images by preset
			return square(filename, abspath, filterImageSize(size.width))
				.then(icons => {
					// remap icons' path for manifest.json
					answers.icons = Object.values(icons).map(i => {
						i.src = path.join(path.relative(manifestDest, abspath), i.src);
						return i;
					});

					// favicon writing by minimum image size
					// to-icon doesn't support that use image of over 512 size
					return writeFavico(path.join(abspath, answers.icons[0].src), manifestDest)
						.then(() => resolve(answers));
				});
		});
	});
};

// main runner
ask.then(prepareIcon)
	.then(squareIcons)
	.then(pwaManifest)
	.then(manifest => {
		pwaManifest.write(manifestDest, manifest);
	})
	.catch(e => {
		console.error(e.stack);
	});
