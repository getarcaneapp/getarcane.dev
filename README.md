# getarcane.dev

Documentation for the Go modules published under `go.getarcane.app`, built with
[Astro Starlight](https://starlight.astro.build) and the
[Lucode](https://lucas-labs.github.io/lucode-starlight-theme/) theme.

## Commands

```sh
pnpm install
pnpm dev       # http://localhost:3002 (stop with `pnpm astro dev stop`)
pnpm build     # static site in dist/
pnpm check     # astro check
pnpm deploy    # build and deploy dist/ with Wrangler
```

## Layout

- `src/content/docs/` holds one page per module. Page URLs mirror import paths, so
  `go.getarcane.app/docker/compat` is documented at `/docker/compat/`.
- `src/data/modules.ts` is the module registry used by the module info header. Keep it in sync
  with the
  [go-vanity](https://github.com/getarcaneapp/go-vanity) Worker's `MODULES` map.
- `src/components/ModuleInfo.astro` renders the import path, source link, pkg.go.dev link, and
  `go get` command at the top of each module page.
- `src/styles/global.css` applies the brand violet to the Lucode theme tokens.

## Adding a module

1. Register it in the go-vanity Worker.
2. Add an entry to `src/data/modules.ts`.
3. Create `src/content/docs/<module path>.mdx` (or `<module path>/index.mdx`) and render
   `<ModuleInfo path="<module path>" />` under the intro.
4. Add the slug to the `sidebar` in `astro.config.mjs` and a `LinkCard` to `src/content/docs/index.mdx`.
