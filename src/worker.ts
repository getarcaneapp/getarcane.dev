// Serves both the Go vanity import paths and the docs site.
//
// - go.getarcane.app, kit.getarcane.app, and any `?go-get=1` request, is handled
//   by the vanity Worker (src/vanity.ts).
// - Everything else is served from the static docs build.

import vanity, { KIT_HOST } from "./vanity.ts";

const VANITY_HOSTS = new Set(["go.getarcane.app", KIT_HOST]);

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { hostname, searchParams } = new URL(request.url);

    if (VANITY_HOSTS.has(hostname) || searchParams.get("go-get") === "1") {
      return vanity.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};
