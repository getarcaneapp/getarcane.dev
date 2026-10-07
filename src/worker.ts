// Serves both the Go vanity import paths and the docs site.
//
// - go.getarcane.app, and any `?go-get=1` request, is handled by the vanity Worker
//   (src/vanity.ts), unchanged from github.com/getarcaneapp/go-vanity.
// - Everything else is served from the static docs build.

import vanity from './vanity.ts';

const VANITY_HOST = 'go.getarcane.app';

interface Env {
	ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { hostname, searchParams } = new URL(request.url);

		if (hostname === VANITY_HOST || searchParams.get('go-get') === '1') {
			return vanity.fetch(request);
		}

		return env.ASSETS.fetch(request);
	},
};
