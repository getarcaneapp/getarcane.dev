import assert from "node:assert/strict";
import { describe, test } from "node:test";
import worker from "./worker.ts";

const ASSET_BODY = "docs asset";
const env = {
  ASSETS: { fetch: async () => new Response(ASSET_BODY) },
};

function request(url: string): Promise<Response> {
  return worker.fetch(new Request(url), env);
}

describe("go.getarcane.app", () => {
  test("serves go-import meta tags", async () => {
    const res = await request("https://go.getarcane.app/updater?go-get=1");
    assert.ok(
      (await res.text()).includes(
        '<meta name="go-import" content="go.getarcane.app/updater git https://github.com/getarcaneapp/kit updater">',
      ),
    );
  });

  test("redirects browsers to GitHub", async () => {
    const res = await request("https://go.getarcane.app/docker/compat");
    assert.equal(res.status, 302);
    assert.equal(
      res.headers.get("Location"),
      "https://github.com/getarcaneapp/kit/tree/main/docker/compat",
    );
  });

  test("returns 404 for unknown paths, never docs", async () => {
    const res = await request("https://go.getarcane.app/guides/introduction/");
    assert.equal(res.status, 404);
  });
});

describe("kit.getarcane.app", () => {
  test("serves go-import meta tags for kit modules", async () => {
    const res = await request("https://kit.getarcane.app/updater?go-get=1");
    assert.ok(
      (await res.text()).includes(
        '<meta name="go-import" content="kit.getarcane.app/updater git https://github.com/getarcaneapp/kit updater">',
      ),
    );
  });

  test("redirects browsers to GitHub", async () => {
    const res = await request("https://kit.getarcane.app/tripwire");
    assert.equal(res.status, 302);
    assert.equal(
      res.headers.get("Location"),
      "https://github.com/getarcaneapp/kit/tree/main/tripwire",
    );
  });

  test("returns 404 for non-kit modules and docs paths", async () => {
    for (const path of ["/arcane?go-get=1", "/guides/introduction/"]) {
      const res = await request(`https://kit.getarcane.app${path}`);
      assert.equal(res.status, 404, path);
    }
  });
});

describe("getarcane.dev", () => {
  test("serves the docs for browser requests, including module paths", async () => {
    for (const path of ["/", "/updater/", "/docker/compat/"]) {
      const res = await request(`https://getarcane.dev${path}`);
      assert.equal(await res.text(), ASSET_BODY, path);
    }
  });

  test("answers go-get requests like the vanity host", async () => {
    const res = await request("https://getarcane.dev/updater?go-get=1");
    assert.ok(
      (await res.text()).includes(
        'content="getarcane.dev/updater git https://github.com/getarcaneapp/kit updater"',
      ),
    );
  });
});
