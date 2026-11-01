// Docs view of the vanity module registry. The registry itself lives in src/vanity.ts.

import { buildRedirectUrl, getModuleRequest } from "../vanity.ts";

export interface GoPackage {
  path: string;
  module: string;
  source: string;
}

export function getPackage(path: string): GoPackage {
  const { hostname, pathname } = new URL(`https://${path}`);
  const req = getModuleRequest(hostname, pathname);
  if (!req) {
    throw new Error(`No module serves "${path}". Add it to src/vanity.ts.`);
  }
  return {
    path,
    module: [hostname, req.moduleName].filter(Boolean).join("/"),
    source: buildRedirectUrl(req.module, req.subpathSegments),
  };
}
