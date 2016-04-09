#!/usr/bin/env node

'use strict';

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _pwaManifest = require('pwa-manifest');

var _pwaManifest2 = _interopRequireDefault(_pwaManifest);

var _pwaInquirer = require('./pwa-inquirer');

var _pwaInquirer2 = _interopRequireDefault(_pwaInquirer);

var _mapObj = require('map-obj');

var _mapObj2 = _interopRequireDefault(_mapObj);

var _decamelize = require('decamelize');

var _decamelize2 = _interopRequireDefault(_decamelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cli = (0, _meow2.default)(['\n\tUsage\n\t\t$ pwa-manifest dest <options>\n\n\tOptions\n\t\t--name Name of app [Default: package name or basedir name]\n\t\t--short_name Short name of app [Default: package name or basedir name]\n\t\t--start_url Start URL [Default: /index.html?homescreen=1]\n\t\t--display Display mode [Default: standalone]\n\t\t--background_color Background color in CSS color [Default: #FFFFFF]\n\t\t--theme_color Theme color in CSS color[Default: #3F51B5]\n\t\t--orientation Orientation [Default: natural]\n\t\t--direction Base direction [Default: standalone]\n\t\t--interactive Creating a manifest in interactive mode [Default: false]\n\n\tExamples\n\t\t$ pwa-manifest --name=\'My Progressive Web App\' --short=\'My PWA\' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait\n\t\t$ pwa-manifest --interactive\n']);

var ask = cli.flags.interactive ? _pwaInquirer2.default.ask() : Promise.resolve((0, _mapObj2.default)(cli.flags, function (key, value) {
	return [(0, _decamelize2.default)(key, '_'), value];
}));
var dest = function dest(input) {
	return input ? input.replace(/manifest.json$/, '') : process.cwd();
};

ask.then(function (answers) {
	return (0, _pwaManifest2.default)(answers);
}).then(function (manifest) {
	_pwaManifest2.default.write(dest(cli.input[0]), manifest);
});