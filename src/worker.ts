// Serves both the Go vanity import paths and the docs site.
//
// - go.getarcane.app, kit.getarcane.app, and any `?go-get=1` request, is handled
//   by the vanity Worker (src/vanity.ts).
// - getarcane.dev/arcane, /cli, /types, and /copacetic redirect browsers to GitHub.
// - Everything else is served from the static docs build.

import vanity, { DOCS_HOST, getModuleRequest, KIT_HOST, VANITY_HOST } from "./vanity.ts";

const VANITY_HOSTS = new Set([VANITY_HOST, KIT_HOST]);

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { hostname, pathname, searchParams } = new URL(request.url);

    if (
      VANITY_HOSTS.has(hostname) ||
      searchParams.get("go-get") === "1" ||
      (hostname === DOCS_HOST && getModuleRequest(hostname, pathname))
    ) {
      return vanity.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};
