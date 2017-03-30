import fs from 'fs';
import test from 'ava';
import execa from 'execa';
import rndTmpdir from 'os-random-tmpdir';
import pwaManifest from 'pwa-manifest';
import path from 'path';
import sizeof from 'image-size';
import cpy from 'cpy';
import dargs from 'dargs';

let tmp;

const opts = {
	name: 'My PWA Name',
	short_name: 'My PWA Short Name',
	start_url: '/main.html?homescreen=1',
	display: 'browser',
	orientation: 'landscape',
	background_color: '#010101',
	icons: './fixtures/logo.png'
};

const verifyIcons = icons => {
	var res = [];
	icons.forEach(dest => {
		const icon = path.resolve(process.cwd(), path.join(tmp, dest.src));
		const size = Math.floor(dest.sizes.slice(0, dest.sizes.indexOf('x')));
		var dimensions = sizeof(icon);

		res.push(
			dimensions.height === size &&
			dimensions.width === size
		);
	});

	return res.every(r => r === true);
};

const verifyFavico = () => {
	const favico = path.resolve(process.cwd(), path.join(tmp, 'favicon.ico'));
	return fs.statSync(favico).isFile();
};

const exec = (input, opts, verify) => {
	return execa('./cli.js', input.concat(dargs(opts)), {cwd: __dirname})
		.then(res => {
			if (res.stdout) {
				console.log(res.stdout);
			}

			if (res.stderr) {
				console.error(res.stderr);
				throw new Error(res.stderr);
			}

			return pwaManifest.read(path.join(tmp));
		})
		.then(m => verify(m))
		.catch(e => {
			verify(e);
		});
};

const prepare = (src, subpath) => {
	subpath = subpath || '';
	tmp = rndTmpdir('pwa-manifest');

	const dest = path.join(tmp, subpath);
	opts.icons = path.join(dest, path.basename(src));

	return cpy([src], dest);
};

test(t => {
	return prepare('./fixtures/logo.png').then(() => {
		return exec([tmp], opts, m => {
			if (m instanceof Error) {
				t.fail();
				return;
			}

			t.is(m.name, opts.name);
			t.not(m.short_name, opts.short_name);
			t.is(m.short_name, 'My PWA Short');
			t.is(m.start_url, opts.start_url);
			t.is(m.display, opts.display);
			t.is(m.orientation, opts.orientation);
			t.is(m.background_color, opts.background_color);
			t.true(verifyIcons(m.icons, tmp));
		});
	});
});

test(t => {
	return prepare('./fixtures/logo-384x384.png').then(() => {
		exec([tmp], opts, m => {
			if (m instanceof Error) {
				t.fail();
				return;
			}

			const last = Object.keys(m.icons).pop();
			t.true(verifyIcons(m.icons, '.'));
			t.is(Math.floor(last), 384);
		});
	});
});

test.serial(t => {
	return prepare('./fixtures/logo-0x0.png').then(() => {
		return exec([tmp], opts, m => {
			if (m instanceof Error) {
				t.pass();
			} else {
				t.fail();
			}
		});
	});
});

test(t => {
	return prepare('./fixtures/logo.png', './image/icons').then(() => {
		return exec([tmp, './image/icons'], opts, m => {
			if (m instanceof Error) {
				t.fail();
				return;
			}

			Object.keys(m.icons).forEach(icon => icon.indexOf('image/icons') === 0);
			t.true(verifyIcons(m.icons));
		});
	});
});

test(t => {
	tmp = rndTmpdir('pwa-manifest');
	opts.icons = 'https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/whatsapp-512.png';

	return exec([tmp], opts, m => {
		if (m instanceof Error) {
			t.fail();
			return;
		}

		Object.keys(m.icons).forEach(icon => icon.indexOf('image/icons') === 0);
		t.true(verifyIcons(m.icons));
		t.true(verifyFavico());
	});
});

test(t => {
	return prepare('./fixtures/logo-384x384.png').then(() => {
		return exec([tmp], opts, m => {
			if (m instanceof Error) {
				console.log(m);
				t.fail();
				return;
			}
		});
	});
});
