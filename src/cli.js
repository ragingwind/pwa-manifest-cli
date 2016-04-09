#!/usr/bin/env node
'use strict';
import meow from 'meow';
import pwaManifest from 'pwa-manifest';
import inquirer from './pwa-inquirer';
import mapObj from 'map-obj';
import decamelize from 'decamelize';

const cli = meow([`
	Usage
		$ pwa-manifest dest <options>

	Options
		--name Name of app [Default: package name or basedir name]
		--short_name Short name of app [Default: package name or basedir name]
		--start_url Start URL [Default: /index.html?homescreen=1]
		--display Display mode [Default: standalone]
		--background_color Background color in CSS color [Default: #FFFFFF]
		--theme_color Theme color in CSS color[Default: #3F51B5]
		--orientation Orientation [Default: natural]
		--direction Base direction [Default: standalone]
		--interactive Creating a manifest in interactive mode [Default: false]

	Examples
		$ pwa-manifest --name='My Progressive Web App' --short='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait
		$ pwa-manifest --interactive
`]);

const ask = cli.flags.interactive ? inquirer.ask() : Promise.resolve(
	mapObj(cli.flags, (key, value) => [decamelize(key, '_'), value])
);
const dest = input => input ? input.replace(/manifest.json$/, '') : process.cwd();

ask.then(answers => {
	return pwaManifest(answers);
}).then(manifest => {
	pwaManifest.write(dest(cli.input[0]), manifest);
});
