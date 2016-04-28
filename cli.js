#!/usr/bin/env node
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

require('babel-polyfill');

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

var _imageSize = require('image-size');

var _imageSize2 = _interopRequireDefault(_imageSize);

var _squareImage = require('square-image');

var _squareImage2 = _interopRequireDefault(_squareImage);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _got = require('got');

var _got2 = _interopRequireDefault(_got);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _osRandomTmpdir = require('os-random-tmpdir');

var _osRandomTmpdir2 = _interopRequireDefault(_osRandomTmpdir);

var _manifestMembers = require('./assets/manifest-members.json');

var _manifestMembers2 = _interopRequireDefault(_manifestMembers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cli = (0, _meow2.default)(['\n\tUsage\n\t\t$ pwa-manifest <manifest path> <icons path> <options>\n\n\tManifest path\n\t\tPath for manifest writing. optional, default is the current directory.\n\n\tIcons path\n\t\tPath for resized icon images. using manifest path if it\'s not set, or relative path to manifest path\n\n\tOptions\n\t\t--name Name of app [Default: package name or basedir name]\n\t\t--short_name Short name of app [Default: package name or basedir name]\n\t\t--start_url Start URL [Default: /index.html?homescreen=1]\n\t\t--display Display mode [Default: standalone]\n\t\t--background_color Background color in CSS color [Default: #FFFFFF]\n\t\t--theme_color Theme color in CSS color[Default: #3F51B5]\n\t\t--orientation Orientation [Default: natural]\n\t\t--direction Base direction [Default: standalone]\n\t\t--icons Target image file it will be resized in multiple sizes\n\t\t--interactive Creating a manifest in interactive mode [Default: false]\n\n\tExamples\n\t\t$ pwa-manifest ./app --icons=./logo.png\n\t\t$ pwa-manifest ./app ./app/images/icons --icons=./logo.png\n\t\t$ pwa-manifest --name=\'My Progressive Web App\' --short=\'My PWA\' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait --icons=./images/logo.png\n\t\t$ pwa-manifest --interactive\n']);

var ask = cli.flags.interactive ? _pwaInquirer2.default.ask() : Promise.resolve((0, _mapObj2.default)(cli.flags, function (key, value) {
	return [(0, _decamelize2.default)(key, '_'), value];
}));
var manifestDest = cli.input[0] ? _path2.default.resolve(process.cwd(), cli.input[0].replace(/manifest.json$/, '')) : process.cwd();
var iconsDest = cli.input[1] ? _path2.default.resolve(process.cwd(), cli.input[1]) : manifestDest;
var filterImageSize = function filterImageSize(max) {
	return (0, _mapObj2.default)(_manifestMembers2.default.icons, function (size, icon) {
		if (size <= max) {
			return [size, icon];
		}
	});
};

var prepareIcon = function prepareIcon(answers) {
	return new Promise(function (resolve, reject) {
		if (!answers.icons) {
			resolve(answers);
		} else if (/^https?/.test(answers.icons)) {
			var url = answers.icons;
			var dir = (0, _osRandomTmpdir2.default)('pwa-manifest');

			_mkdirp2.default.sync(dir);
			answers.icons = _path2.default.join(dir, _path2.default.basename(answers.icons));

			_got2.default.stream(url).pipe(_fs2.default.createWriteStream(answers.icons).on('finish', function () {
				return resolve(answers);
			}).on('error', function () {
				return reject();
			}));
		} else {
			answers.icons = _path2.default.resolve(process.cwd(), answers.icons);
			resolve(answers);
		}
	});
};

var squareIcon = function squareIcon(answers) {
	if (answers.icons) {
		var _ret = function () {
			var filename = answers.icons;
			var abspath = _path2.default.resolve(manifestDest, iconsDest);
			var size = (0, _imageSize2.default)(filename);

			_mkdirp2.default.sync(abspath);

			// resize images by preset
			return {
				v: (0, _squareImage2.default)(filename, abspath, filterImageSize(size.width)).then(function (icons) {
					answers.icons = Object.values(icons).map(function (i) {
						i.src = _path2.default.join(_path2.default.relative(manifestDest, abspath), i.src);
						return i;
					});
					return answers;
				})
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}

	return answers;
};

ask.then(prepareIcon).then(squareIcon).then(_pwaManifest2.default).then(function (manifest) {
	_pwaManifest2.default.write(manifestDest, manifest);
}).catch(function (e) {
	console.error(e.stack);
});