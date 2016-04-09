'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _ansiStyles = require('ansi-styles');

var _ansiStyles2 = _interopRequireDefault(_ansiStyles);

var _readPkg = require('read-pkg');

var _readPkg2 = _interopRequireDefault(_readPkg);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _manifestMembers = require('./assets/manifest-members.json');

var _manifestMembers2 = _interopRequireDefault(_manifestMembers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pkg = _readPkg2.default.sync();

var PWAInquirer = function () {
	function PWAInquirer() {
		_classCallCheck(this, PWAInquirer);
	}

	_createClass(PWAInquirer, null, [{
		key: 'choices',
		value: function choices(member, pred) {
			var choices = [];

			for (var v in _manifestMembers2.default[member]) {
				if (_manifestMembers2.default[member].hasOwnProperty(v)) {
					var choice = {
						key: v,
						name: v + ' ' + _ansiStyles2.default.gray.open + '(' + _manifestMembers2.default[member][v] + ')' + _ansiStyles2.default.gray.close,
						value: v
					};

					choices.push(pred ? pred(_manifestMembers2.default[member], v) : choice);
				}
			}

			return choices;
		}
	}, {
		key: 'ask',
		value: function ask() {
			return new Promise(function (resolve) {
				_inquirer2.default.prompt(PWAInquirer.questions, function (answers) {
					resolve(answers);
				});
			});
		}
	}, {
		key: 'questions',
		get: function get() {
			return [{
				type: 'input',
				name: 'name',
				message: 'Name',
				default: PWAInquirer.name
			}, {
				type: 'input',
				name: 'short_name',
				message: 'Short name',
				default: PWAInquirer.name
			}, {
				type: 'input',
				name: 'start_url',
				message: 'Start URL',
				default: '/index.html?homescreen=1'
			}, {
				type: 'list',
				name: 'display',
				message: 'Display',
				choices: PWAInquirer.choices('display')
			}, {
				type: 'list',
				name: 'background_color',
				message: 'Background color',
				choices: PWAInquirer.colors
			}, {
				type: 'list',
				name: 'theme_color',
				message: 'Theme color',
				choices: PWAInquirer.colors
			}, {
				type: 'list',
				name: 'orientation',
				message: 'Orientation',
				choices: PWAInquirer.choices('orientation')
			}, {
				type: 'list',
				name: 'direction',
				message: 'Base direction',
				choices: PWAInquirer.choices('dir')
			}];
		}
	}, {
		key: 'name',
		get: function get() {
			return pkg.name || _path2.default.basename(process.cwd());
		}
	}, {
		key: 'colors',
		get: function get() {
			return PWAInquirer.choices('colors', function (colors, m) {
				var color = colors[m];

				return {
					key: m,
					name: _ansiStyles2.default[color.ansi].open + m + _ansiStyles2.default[color.ansi].close,
					value: color.hex
				};
			});
		}
	}]);

	return PWAInquirer;
}();

module.exports = PWAInquirer;