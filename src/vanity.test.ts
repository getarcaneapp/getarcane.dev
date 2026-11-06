import assert from "node:assert/strict";
import { describe, test } from "node:test";
import worker from "./vanity.ts";

const TEST_DOMAIN = "go.getarcane.app";
const ARCANE_REPO_URL = "https://github.com/getarcaneapp/arcane";
const KIT_REPO_URL = "https://github.com/getarcaneapp/kit";

interface TestModule {
  repoUrl: string;
  subdir?: string;
}

const MODULES: Record<string, TestModule> = {
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
  arcane: { repoUrl: ARCANE_REPO_URL, subdir: "backend" },
  cli: { repoUrl: ARCANE_REPO_URL, subdir: "cli" },
  types: { repoUrl: ARCANE_REPO_URL, subdir: "types" },
};

function request(path: string): Promise<Response> {
  return worker.fetch(new Request(`https://${TEST_DOMAIN}${path}`));
}

function expectedGoImport(hostname: string, moduleName: string): string {
  const module = MODULES[moduleName];
  return `<meta name="go-import" content="${[`${hostname}/${moduleName}`, "git", module.repoUrl, module.subdir].filter(Boolean).join(" ")}">`;
}

function expectedRedirect(moduleName: string, ...subpathSegments: string[]): string {
  const module = MODULES[moduleName];
  const path = [module.subdir, ...subpathSegments].filter(Boolean).join("/");
  return `${module.repoUrl}/tree/main/${path}`;
}

// ---------------------------------------------------------------------------
// Root path
// ---------------------------------------------------------------------------
describe("root path", () => {
  test("returns 404", async () => {
    const res = await request("/");
    assert.equal(res.status, 404);
  });

  test("body says Not Found", async () => {
    const res = await request("/");
    assert.equal(await res.text(), "Not Found");
  });
});

// ---------------------------------------------------------------------------
// Unknown module
// ---------------------------------------------------------------------------
describe("unknown module", () => {
  test("returns 404 for unregistered module", async () => {
    const res = await request("/unknown-module");
    assert.equal(res.status, 404);
  });

  test("body says Not Found", async () => {
    const res = await request("/unknown-module");
    assert.equal(await res.text(), "Not Found");
  });

  test("returns 404 for prototype-inherited key", async () => {
    const res = await request("/__proto__");
    assert.equal(res.status, 404);
  });
});

// ---------------------------------------------------------------------------
// go-get requests (Go toolchain)
// ---------------------------------------------------------------------------
describe("go-get request", () => {
  test("returns 200", async () => {
    const res = await request("/arcane?go-get=1");
    assert.equal(res.status, 200);
  });

  test("Content-Type is text/html", async () => {
    const res = await request("/arcane?go-get=1");
    assert.equal(res.headers.get("Content-Type"), "text/html; charset=utf-8");
  });

  test("Cache-Control disables downstream HTML transformations", async () => {
    const res = await request("/arcane?go-get=1");
    assert.equal(res.headers.get("Cache-Control"), "no-transform");
  });

  for (const moduleName of Object.keys(MODULES)) {
    test(`contains go-import meta tag with correct content for ${moduleName}`, async () => {
      const res = await request(`/${moduleName}?go-get=1`);
      const html = await res.text();
      assert.ok(html.includes(expectedGoImport(TEST_DOMAIN, moduleName)));
    });
  }

  test("go-get with subpath still resolves the module", async () => {
    const res = await request("/arcane/pkg?go-get=1");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes(expectedGoImport(TEST_DOMAIN, "arcane")));
  });
});

// ---------------------------------------------------------------------------
// Browser requests (no go-get param → redirect)
// ---------------------------------------------------------------------------
describe("browser redirect", () => {
  test("returns 302", async () => {
    const res = await request("/arcane");
    assert.equal(res.status, 302);
  });

  for (const moduleName of Object.keys(MODULES)) {
    test(`redirects ${moduleName} to the module directory in GitHub`, async () => {
      const res = await request(`/${moduleName}`);
      assert.equal(res.headers.get("Location"), expectedRedirect(moduleName));
    });
  }

  test("redirect keeps subpaths inside the module directory", async () => {
    const res = await request("/arcane/pkg/");
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("Location"), expectedRedirect("arcane", "pkg"));
  });
});

// ---------------------------------------------------------------------------
// Domain derived from request URL
// ---------------------------------------------------------------------------
describe("copacetic fork", () => {
  const COPACETIC_REPO_URL = "https://github.com/getarcaneapp/copacetic";

  test("serves the module root without a subdirectory", async () => {
    const res = await worker.fetch(
      new Request("https://getarcane.dev/copacetic/pkg/patch?go-get=1"),
    );
    assert.equal(res.status, 200);
    assert.ok(
      (await res.text()).includes(
        `<meta name="go-import" content="getarcane.dev/copacetic git ${COPACETIC_REPO_URL}">`,
      ),
    );
  });

  test("redirects browsers to the fork on GitHub", async () => {
    const res = await worker.fetch(new Request("https://getarcane.dev/copacetic/pkg/patch"));
    assert.equal(res.headers.get("Location"), `${COPACETIC_REPO_URL}/tree/main/pkg/patch`);
  });

  test("is not served from go.getarcane.app", async () => {
    const res = await worker.fetch(new Request("https://go.getarcane.app/copacetic?go-get=1"));
    assert.equal(res.status, 404);
  });
});

describe("domain from request URL", () => {
  test("uses the request hostname in go-import meta tag", async () => {
    const res = await worker.fetch(new Request("https://getarcane.dev/cli?go-get=1"));
    const html = await res.text();
    assert.ok(html.includes(expectedGoImport("getarcane.dev", "cli")));
  });
});

// ---------------------------------------------------------------------------
// kit.getarcane.app has its own module table, rooted at the kit/ directory
// ---------------------------------------------------------------------------
describe("kit host", () => {
  const KIT_HOST = "kit.getarcane.app";
  const root = `${KIT_HOST} git ${KIT_REPO_URL} kit`;
  const cases: [path: string, meta: string, location: string][] = [
    ["/", root, `${KIT_REPO_URL}/tree/main/kit`],
    ["/fs", root, `${KIT_REPO_URL}/tree/main/kit/fs`],
    ["/sys/bytes", root, `${KIT_REPO_URL}/tree/main/kit/sys/bytes`],
    ["/sys/crypto", root, `${KIT_REPO_URL}/tree/main/kit/sys/crypto`],
    ["/acfs", `${KIT_HOST}/acfs git ${KIT_REPO_URL} acfs`, `${KIT_REPO_URL}/tree/main/acfs`],
    [
      "/builds",
      `${KIT_HOST}/builds git ${KIT_REPO_URL} builds`,
      `${KIT_REPO_URL}/tree/main/builds`,
    ],
    [
      "/docker/compat",
      `${KIT_HOST}/docker git ${KIT_REPO_URL} docker`,
      `${KIT_REPO_URL}/tree/main/docker/compat`,
    ],
    [
      "/docker/streams/logs",
      `${KIT_HOST}/docker git ${KIT_REPO_URL} docker`,
      `${KIT_REPO_URL}/tree/main/docker/streams/logs`,
    ],
    [
      "/docker/convert",
      `${KIT_HOST}/docker/convert git ${KIT_REPO_URL} docker/convert`,
      `${KIT_REPO_URL}/tree/main/docker/convert`,
    ],
    [
      "/sys/cgroup",
      `${KIT_HOST}/sys/cgroup git ${KIT_REPO_URL} sys/cgroup`,
      `${KIT_REPO_URL}/tree/main/sys/cgroup`,
    ],
    [
      "/tripwire",
      `${KIT_HOST}/tripwire git ${KIT_REPO_URL} tripwire`,
      `${KIT_REPO_URL}/tree/main/tripwire`,
    ],
    [
      "/updater",
      `${KIT_HOST}/updater git ${KIT_REPO_URL} updater`,
      `${KIT_REPO_URL}/tree/main/updater`,
    ],
  ];

  function kitRequest(path: string): Promise<Response> {
    return worker.fetch(new Request(`https://${KIT_HOST}${path}`));
  }

  for (const [path, meta, location] of cases) {
    test(`serves go-import for ${KIT_HOST}${path}`, async () => {
      const res = await kitRequest(`${path}?go-get=1`);
      assert.equal(res.status, 200);
      assert.ok((await res.text()).includes(`<meta name="go-import" content="${meta}">`));
    });

    test(`redirects ${KIT_HOST}${path} to GitHub`, async () => {
      const res = await kitRequest(path);
      assert.equal(res.headers.get("Location"), location);
    });
  }
});
