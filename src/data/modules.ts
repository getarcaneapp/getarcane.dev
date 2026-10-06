// Mirrors the module registry served by the go-vanity Worker
// (github.com/getarcaneapp/go-vanity, src/index.ts). Keep the two in sync.

export const VANITY_HOST = 'go.getarcane.app';
export const KIT_REPO = 'https://github.com/getarcaneapp/kit';
export const SYS_REPO = 'https://github.com/getarcaneapp/sys';

export type ModuleCategory = 'core' | 'filesystem' | 'docker' | 'streaming' | 'system';

export interface GoModule {
	/** Path below the vanity host, e.g. "docker/compat". */
	path: string;
	repo: string;
	/** Directory inside `repo` holding go.mod. Omit for a module at the repository root. */
	subdir?: string;
	category: ModuleCategory;
	summary: string;
	/** Docs page slug, without leading or trailing slashes. */
	slug: string;
	deprecated?: string;
}

export const MODULES: GoModule[] = [
	{
		path: 'kit',
		repo: KIT_REPO,
		category: 'core',
		slug: 'kit',
		summary: 'Shared helpers: normalization, paths, registries, mapping, signals, and more.',
	},
	{
		path: 'acfs',
		repo: KIT_REPO,
		subdir: 'acfs',
		category: 'filesystem',
		slug: 'acfs',
		summary: 'Root-confined filesystem operations with atomic writes and a JSON CLI.',
	},
	{
		path: 'docker',
		repo: KIT_REPO,
		subdir: 'docker',
		category: 'docker',
		slug: 'docker',
		summary: 'Docker Engine helpers: Compose labels, mounts, networks, exec, and logs.',
	},
	{
		path: 'docker/compat',
		repo: KIT_REPO,
		subdir: 'docker/compat',
		category: 'docker',
		slug: 'docker/compat',
		summary: 'Gates newer daemon features behind the API version a daemon speaks.',
	},
	{
		path: 'docker/convert',
		repo: KIT_REPO,
		subdir: 'docker/convert',
		category: 'docker',
		slug: 'docker/convert',
		summary: 'Converts `docker run` commands into Compose YAML.',
	},
	{
		path: 'builds',
		repo: KIT_REPO,
		subdir: 'builds',
		category: 'docker',
		slug: 'builds',
		summary: 'BuildKit-backed image builds through Docker or Depot.',
	},
	{
		path: 'updater',
		repo: KIT_REPO,
		subdir: 'updater',
		category: 'docker',
		slug: 'updater',
		summary: 'Docker auto-update orchestration with Compose and self-update support.',
	},
	{
		path: 'streams',
		repo: KIT_REPO,
		subdir: 'streams',
		category: 'streaming',
		slug: 'streams',
		summary: 'Stream fan-in, pub/sub buses, log broadcasting, and stats history.',
	},
	{
		path: 'sys/bytes',
		repo: KIT_REPO,
		subdir: 'sys/bytes',
		category: 'system',
		slug: 'sys/bytes',
		summary: 'Human-readable byte capacities that parse and format like Linux tools.',
	},
	{
		path: 'sys/cgroup',
		repo: KIT_REPO,
		subdir: 'sys/cgroup',
		category: 'system',
		slug: 'sys/cgroup',
		summary: 'cgroup v1/v2 limit detection and container identity probes.',
	},
	{
		path: 'sys/crypto',
		repo: KIT_REPO,
		subdir: 'sys/crypto',
		category: 'system',
		slug: 'sys/crypto',
		summary: 'AES-256-GCM string encryption with key rotation.',
	},
	{
		path: 'sys/atomic',
		repo: SYS_REPO,
		subdir: 'atomic',
		category: 'system',
		slug: 'sys/atomic',
		summary: 'Legacy atomic file writes. Use acfs/atomic instead.',
		deprecated: 'go.getarcane.app/acfs/atomic',
	},
];

export function getModule(path: string): GoModule {
	const mod = MODULES.find((m) => m.path === path);
	if (!mod) {
		throw new Error(`Unknown module "${path}". Add it to src/data/modules.ts.`);
	}
	return mod;
}

export const importPath = (mod: GoModule) => `${VANITY_HOST}/${mod.path}`;

export const sourceUrl = (mod: GoModule) =>
	mod.subdir ? `${mod.repo}/tree/main/${mod.subdir}` : mod.repo;

export const pkgGoDevUrl = (mod: GoModule) => `https://pkg.go.dev/${importPath(mod)}`;
