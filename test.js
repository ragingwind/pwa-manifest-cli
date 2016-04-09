import test from 'ava';
import execa from 'execa';
import osTmpdir from 'os-tmpdir';
import pwaManifest from 'pwa-manifest';
import path from 'path';

const tmp = osTmpdir();
const opts = {
	name: 'My Short PWA Name',
	short_name: 'My PWA Short Name',
	start_url: '/main.html?homescreen=1',
	display: 'browser',
	orientation: 'landscape',
	background_color: '#010101'
};
const args = [tmp].concat(Object.keys(opts).map(m => `--${m}=${opts[m]}`));

test('title', t => {
	return execa('./cli.js', args, {cwd: __dirname})
		.then(() => pwaManifest.read(path.join(tmp)))
		.then(m => {
			t.is(m.name, opts.name);
			t.not(m.short_name, opts.short_name);
			t.is(m.short_name, 'My PWA Short');
			t.is(m.start_url, opts.start_url);
			t.is(m.display, opts.display);
			t.is(m.orientation, opts.orientation);
			t.is(m.background_color, opts.background_color);
		});
});
