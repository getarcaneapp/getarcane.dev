// Docs view of the vanity module registry. The registry itself lives in src/vanity.ts.

import { MODULES } from '../vanity.ts';

export const VANITY_HOST = 'go.getarcane.app';

/** Modules whose docs page should point users at a replacement. */
const DEPRECATED: Record<string, string> = {
	'sys/atomic': 'go.getarcane.app/acfs/atomic',
};

export interface GoModule {
	/** Path below the vanity host, e.g. "docker/compat". */
	path: string;
	repo: string;
	/** Directory inside `repo` holding go.mod. Omit for a module at the repository root. */
	subdir?: string;
	deprecated?: string;
}

export function getModule(path: string): GoModule {
	if (!Object.hasOwn(MODULES, path)) {
		throw new Error(`Unknown module "${path}". Add it to MODULES in src/vanity.ts.`);
	}
	const { repoUrl, subdir } = MODULES[path];
	return { path, repo: repoUrl, subdir, deprecated: DEPRECATED[path] };
}

export const importPath = (mod: GoModule) => `${VANITY_HOST}/${mod.path}`;

export const sourceUrl = (mod: GoModule) =>
	mod.subdir ? `${mod.repo}/tree/main/${mod.subdir}` : mod.repo;

export const pkgGoDevUrl = (mod: GoModule) => `https://pkg.go.dev/${importPath(mod)}`;
