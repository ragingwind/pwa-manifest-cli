import inquirer from 'inquirer';
import ansi from 'ansi-styles';
import readPkg from 'read-pkg';
import path from 'path';
import afile from 'afile';
import members from './assets/manifest-members.json';

let pkg;

if (afile.sync(path.join(process.cwd(), 'package.json'))) {
	pkg = readPkg.sync();
}

class PWAInquirer {
	static get questions() {
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

	static get name() {
		return (pkg && pkg.name) || path.basename(process.cwd());
	}

	static get colors() {
		return PWAInquirer.choices('colors', (colors, m) => {
			let color = colors[m];

			return {
				key: m,
				name: ansi[color.ansi].open + m + ansi[color.ansi].close,
				value: color.hex
			};
		});
	}

	static choices(member, pred) {
		var choices = [];

		for (const v in members[member]) {
			if (members[member].hasOwnProperty(v)) {
				let choice = {
					key: v,
					name: `${v} ${ansi.gray.open}(${members[member][v]})${ansi.gray.close}`,
					value: v
				};

				choices.push(pred ? pred(members[member], v) : choice);
			}
		}

		return choices;
	}

	static ask() {
		return new Promise(resolve => {
			inquirer.prompt(PWAInquirer.questions, answers => {
				resolve(answers);
			});
		});
	}
}

module.exports = PWAInquirer;
