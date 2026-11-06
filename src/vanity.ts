const REPO_URL = "https://github.com/getarcaneapp/arcane";
const DEFAULT_BRANCH = "main";

const KIT_REPO_URL = "https://github.com/getarcaneapp/kit";

const COPACETIC_REPO_URL = "https://github.com/getarcaneapp/copacetic";

interface VanityModule {
  repoUrl: string;
  subdir?: string;
}

interface ModuleRequest {
  moduleName: string;
  module: VanityModule;
  subpathSegments: string[];
}

// "" is the root module in kit/; it catches every path without a more specific module.
const KIT_MODULES: Record<string, VanityModule> = {
  "": { repoUrl: KIT_REPO_URL, subdir: "kit" },
  acfs: { repoUrl: KIT_REPO_URL, subdir: "acfs" },
  builds: { repoUrl: KIT_REPO_URL, subdir: "builds" },
  docker: { repoUrl: KIT_REPO_URL, subdir: "docker" },
  "docker/convert": { repoUrl: KIT_REPO_URL, subdir: "docker/convert" },
  "sys/cgroup": { repoUrl: KIT_REPO_URL, subdir: "sys/cgroup" },
  tripwire: { repoUrl: KIT_REPO_URL, subdir: "tripwire" },
  updater: { repoUrl: KIT_REPO_URL, subdir: "updater" },
};

// Frozen: keeps versions published before the move to kit.getarcane.app resolvable.
const MODULES: Record<string, VanityModule> = {
  kit: { repoUrl: KIT_REPO_URL },
  acfs: { repoUrl: KIT_REPO_URL, subdir: "acfs" },
  builds: { repoUrl: KIT_REPO_URL, subdir: "builds" },
  updater: { repoUrl: KIT_REPO_URL, subdir: "updater" },
  streams: { repoUrl: KIT_REPO_URL, subdir: "streams" },
  "sys/bytes": { repoUrl: KIT_REPO_URL, subdir: "sys/bytes" },
  "sys/cgroup": { repoUrl: KIT_REPO_URL, subdir: "sys/cgroup" },
  "sys/crypto": { repoUrl: KIT_REPO_URL, subdir: "sys/crypto" },
  docker: { repoUrl: KIT_REPO_URL, subdir: "docker" },
  "docker/convert": { repoUrl: KIT_REPO_URL, subdir: "docker/convert" },
  "docker/compat": { repoUrl: KIT_REPO_URL, subdir: "docker/compat" },

  arcane: { repoUrl: REPO_URL, subdir: "backend" },
  cli: { repoUrl: REPO_URL, subdir: "cli" },
  types: { repoUrl: REPO_URL, subdir: "types" },
};

// getarcane.dev also serves the docs site: never add docs pages under /arcane, /cli, /types, or /copacetic.
const DOCS_HOST_MODULES: Record<string, VanityModule> = {
  arcane: { repoUrl: REPO_URL, subdir: "backend" },
  cli: { repoUrl: REPO_URL, subdir: "cli" },
  types: { repoUrl: REPO_URL, subdir: "types" },
  copacetic: { repoUrl: COPACETIC_REPO_URL },
};

const DOCS_HOST = "getarcane.dev";
const KIT_HOST = "kit.getarcane.app";
const VANITY_HOST = "go.getarcane.app";

// Module table per host. Unknown hosts serve nothing.
const HOST_MODULES: Record<string, Record<string, VanityModule>> = {
  [DOCS_HOST]: DOCS_HOST_MODULES,
  [KIT_HOST]: KIT_MODULES,
  [VANITY_HOST]: MODULES,
};

const GO_GET_RESPONSE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-transform",
} satisfies HeadersInit;

function getModuleRequest(hostname: string, pathname: string): ModuleRequest | null {
  if (!Object.hasOwn(HOST_MODULES, hostname)) {
    return null;
  }

  const modules = HOST_MODULES[hostname];
  const pathSegments = pathname.split("/").filter(Boolean);

  for (let segmentCount = pathSegments.length; segmentCount >= 0; segmentCount--) {
    const moduleName = pathSegments.slice(0, segmentCount).join("/");
    if (!Object.hasOwn(modules, moduleName)) {
      continue;
    }

    return {
      moduleName,
      module: modules[moduleName],
      subpathSegments: pathSegments.slice(segmentCount),
    };
  }

  return null;
}

function buildGoImportMeta(
  hostname: string,
  moduleName: string,
  { repoUrl, subdir }: VanityModule,
): string {
  const metaContent = [[hostname, moduleName].filter(Boolean).join("/"), "git", repoUrl, subdir]
    .filter(Boolean)
    .join(" ");

  return `<!DOCTYPE html><meta name="go-import" content="${metaContent}">`;
}

function buildRedirectUrl({ repoUrl, subdir }: VanityModule, subpathSegments: string[]): string {
  const redirectPath = [subdir, ...subpathSegments].filter(Boolean).join("/");

  return `${repoUrl}/tree/${DEFAULT_BRANCH}/${redirectPath}`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { hostname, pathname, searchParams } = new URL(request.url);
    const moduleRequest = getModuleRequest(hostname, pathname);

    if (!moduleRequest) {
      return new Response("Not Found", { status: 404 });
    }

    const { moduleName, module, subpathSegments } = moduleRequest;

    // Go toolchain request — serve the go-import meta tag
    if (searchParams.get("go-get") === "1") {
      return new Response(buildGoImportMeta(hostname, moduleName, module), {
        headers: GO_GET_RESPONSE_HEADERS,
      });
    }

    return Response.redirect(buildRedirectUrl(module, subpathSegments), 302);
  },
};

// Shared with the docs (src/data/modules.ts) so the module list lives in one place.
export { buildRedirectUrl, DOCS_HOST, getModuleRequest, KIT_HOST, VANITY_HOST };
