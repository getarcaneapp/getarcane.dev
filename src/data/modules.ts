// Docs view of the vanity module registry. The registry itself lives in src/vanity.ts.

import { KIT_HOST, MODULES } from "../vanity.ts";

export const VANITY_HOST = "go.getarcane.app";

const HOSTS: Record<string, string> = {
  tripwire: KIT_HOST,
};

const DEPRECATED: Record<string, string> = {
  "sys/atomic": "go.getarcane.app/acfs/atomic",
};

export interface GoModule {
  path: string;
  host: string;
  repo: string;
  subdir?: string;
  deprecated?: string;
}

export function getModule(path: string): GoModule {
  if (!Object.hasOwn(MODULES, path)) {
    throw new Error(`Unknown module "${path}". Add it to MODULES in src/vanity.ts.`);
  }
  const { repoUrl, subdir } = MODULES[path];
  return {
    path,
    host: HOSTS[path] ?? VANITY_HOST,
    repo: repoUrl,
    subdir,
    deprecated: DEPRECATED[path],
  };
}

export const importPath = (mod: GoModule) => `${mod.host}/${mod.path}`;

export const sourceUrl = (mod: GoModule) =>
  mod.subdir ? `${mod.repo}/tree/main/${mod.subdir}` : mod.repo;

export const pkgGoDevUrl = (mod: GoModule) => `https://pkg.go.dev/${importPath(mod)}`;
