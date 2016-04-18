import test from 'ava';
import execa from 'execa';
import osTmpdir from 'os-tmpdir';
import pwaManifest from 'pwa-manifest';
import path from 'path';
import sizeof from 'image-size';
import cpy from 'cpy';

let tmp = osTmpdir();

const opts = {
	name: 'My Short PWA Name',
	short_name: 'My PWA Short Name',
	start_url: '/main.html?homescreen=1',
	display: 'browser',
	orientation: 'landscape',
	background_color: '#010101',
	icons: './fixtures/logo.png'
};

const rndTmpdir = max => path.join(osTmpdir(),
	(Math.floor(Math.random() * (max - 0)) + 0).toString());

const args = (input, params) => input.concat(Object.keys(params).map(m => `--${m}=${opts[m]}`));

const verifyIcons = icons => {
	var res = [];
	Object.keys(icons).forEach(size => {
		const icon = path.resolve(process.cwd(), path.join(tmp, icons[size].src));
		var dimensions = sizeof(icon);
		size = Math.floor(size);
		res.push(
			dimensions.height === size &&
			dimensions.width === size
		);
	});

	return res.every(r => r === true);
};

const exec = (input, opts, verify) => {
	return execa('./cli.js', args(input, opts), {cwd: __dirname})
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
	tmp = rndTmpdir(99999999);

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
			t.ok(verifyIcons(m.icons, tmp));
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
			t.ok(verifyIcons(m.icons, '.'));
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
			t.ok(verifyIcons(m.icons));
		});
	});
});
