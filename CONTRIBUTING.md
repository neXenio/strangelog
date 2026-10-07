# Contributing

How to work on this repository, for humans and AI coding agents. `README.md` describes strangelog
for its users; this file describes how to change it.

## What this project is

strangelog is a small npm package (CLI + JavaScript API) for file-based changelogs. Every change is
one YAML file in `changelog/next/`, so parallel branches never conflict on a changelog file.
`bump` moves `next/` into a version directory and `generate` renders all entries to Markdown.

- Public JS API: `require('strangelog')` -> `index.js` -> `lib/index.js` -> `connectChangelog(config)`
  plus `CURRENT_VERSION` and the TypeScript types from `src/types.ts`. TypeScript consumers get
  them through the generated declarations (`types` in `package.json` -> `lib/index.d.ts`).
- CLI binary: `strangelog` -> `lib/cli/index.js`.
- `lib/` is build output (git-ignored, CommonJS `.js` plus `.d.ts`). Edit `src/`, never `lib/`.

Keep both surfaces backwards compatible: consumer projects have years of entry files and
`.strangelogrc` files in the formats described below.

## Setup and commands

Requirements: Node.js `^22.18.0 || >=24.11.0` (`.nvmrc` = 24) and Yarn classic `1.22.22`
(`packageManager` in `package.json`). Do not switch package managers or commit a `package-lock.json`.

| Command | What it does |
| --- | --- |
| `yarn install --frozen-lockfile` | installs dependencies; `prepare` compiles `src/` to `lib/` |
| `yarn compile` | `tsc -p tsconfig.build.json`: `src/` -> `lib/` (CommonJS + `.d.ts`) |
| `yarn test-ci` | full Jest suite, `--runInBand` |
| `yarn jest --config=jest.config.json <file>` | run one spec file (prefer this while iterating) |
| `yarn lint` / `yarn lint-fix` | ESLint (flat config in `eslint.config.mjs`) |
| `yarn typecheck` | TypeScript type check of `src/` and `test/` (`tsc --noEmit`) |
| `yarn ci-pipeline` | tests + lint + typecheck, exactly what CI runs |
| `node test/smoke.cjs` | smoke test of the compiled `lib/` (run `yarn compile` first) |
| `yarn start <command>` | run the CLI from source via `tsx`, e.g. `yarn start --help` |

A change is done when `yarn ci-pipeline` passes, `yarn compile && node test/smoke.cjs` passes, and
the change has a changelog entry (see below).

## Repository layout

```
src/
  index.ts                  package entry: re-exports src/api and src/types
  types.ts                  shared types (ConfigType, EntryType, ChangelogAPIType, ...)
  getProjectConfig.ts       reads .strangelogrc (YAML) from the cwd, merges defaults
  api/
    connectChangelog.ts     binds config to all API functions; the public API object
    addEntry.ts             writes next/<ISO-date>_<kind>_<component>.yml
    bumpNextVersion.ts      renames next/ to <version>/
    getChangelogData.ts     reads all versions and entries, grouped by kind
    getSortedChangelogVersions.ts
    getPossibleNextVersions.ts / getAutomaticNextVersion.ts   version suggestions for bump
    renameComponent.ts      moves entries between components
    generate.ts             renders Markdown via templates/defaultTemplate.ts
    changelogInfo.ts        info.yml (format version) handling
    migrate.ts + migrations/  on-disk format migrations
    utils.ts                globPaths, component helpers, string helpers
  cli/
    index.ts                bin entry (shebang)
    cli.ts                  yargs command definitions
    commands/*.ts           one file per command; prompts via inquirer
  templates/defaultTemplate.ts
test/
  specs/api/*.spec.ts       API tests
  specs/cli/*.spec.ts       CLI tests (spawn the CLI from source)
  factories/                test project / changelog fixtures
  utils.ts                  runCLI(), YAML/glob helpers
  runSourceCLI.cjs          CLI entry for tests (runs src/ through tsx)
  smoke.cjs                 smoke test of the compiled lib/
tsconfig.json               type check settings for src/ and test/ (no emit)
tsconfig.build.json         build settings: src/ -> lib/ with declarations
changelog/                  this project's own changelog (strangelog dogfoods itself)
```

## On-disk formats (do not break)

- `.strangelogrc` (YAML, project root, optional): `path` (default `./changelog`) and `components`,
  a map of component ID to either a title string or `{ title, enabled }`. `enabled: false` hides a
  component from `strangelog add` but keeps rendering its entries. Always accept both forms; use
  `getComponentTitle()` / `isComponentEnabled()` from `src/api/utils.ts` instead of reading values
  directly.
- Entry files: `<changelog path>/<version or next>/<date>_<kind>_<component or "all">.yml` with
  `dateTime` (ISO string, quoted), `component` (ID or `null`), `kind`, `description`. The date part
  uses `-` instead of `:` so that Windows can check out the files.
- Kinds: `addition`, `change`, `fix`, `removal`, `deprecation`, `security`. They are listed in
  `src/types.ts` (`EntryKindType`), `src/api/getChangelogData.ts`, `src/templates/defaultTemplate.ts`
  and `src/cli/commands/add.ts`. Keep these four places in sync.
- `info.yml` in the changelog path stores the format version (`version: <n>`). `n` is the number of
  migrations in `src/api/migrations/index.ts` (`CURRENT_VERSION`).

### Adding a migration

Only when the on-disk format changes. Add `src/api/migrations/<n>_<name>.ts` exporting a
`(config) => void`, append it to the array in `migrations/index.ts` (this bumps `CURRENT_VERSION`),
add tests to `test/specs/api/migrate.spec.ts`, and document the user-visible effect in the README
(`strangelog migrate`). Migrations must be idempotent per file and must never delete entries.

## Code conventions

- Sources and tests are TypeScript (`.ts`) with `strict: true`. Annotate exported functions. No
  `any` (`@typescript-eslint/no-explicit-any` is an error) and no `as unknown as` double casts.
  Where a value really has an unknown shape (`js-yaml`'s `load()` returns `unknown`), cast once at
  that boundary to the domain type (`load(...) as EntryType`) and keep the rest typed.
- Use `import type { ... }` for type-only imports. `isolatedModules` is on, so every file must
  compile on its own (ts-jest and tsx transpile file by file).
- Types of dependencies come from the packages themselves or from `@types/*` dev dependencies
  (`@types/node`, `@types/jest`, `@types/fs-extra`, `@types/semver`, `@types/yargs`).
  `@types/node` follows the oldest supported Node.js major (22), so tsc flags APIs that Node 22
  lacks.
- ESLint enforces the style; run `yarn lint-fix` and then read the result, since some fixes (for
  example `object-property-newline`) produce awkward layouts that are better rewritten by hand.
  Notable rules: single quotes, semicolons, max line length 100, `func-style: declaration`,
  a blank line after variable declarations and before `return`, `import-x/order` with blank lines
  between import groups, no CommonJS in `.ts` files (use `.cjs` for plain Node scripts),
  `no-undefined`, no nested ternaries. `import-x/named` is off because tsc already checks named
  imports and import-x cannot follow the `fs` re-exports of `@types/fs-extra`.
- ES module syntax in `src/`; tsc compiles it to CommonJS. That relies on `package.json` having no
  `"type": "module"` and on `module: nodenext` in `tsconfig.json`, which treats every `.ts` file
  as CommonJS: relative imports stay extensionless, and ESM-only dependencies (`yargs`, `inquirer`)
  are loaded via `require()` of ES modules, which the supported Node.js versions provide. Do not
  add `"type": "module"` or switch `module`: `lib/` would then contain `import` statements and the
  published package would break while all tests still pass.
- Globbing: use `globPaths()` from `src/api/utils.ts`, not `globSync` directly. It sets
  `windowsPathsNoEscape` so `path.join()`-built patterns work on Windows. glob does not sort its
  results; sort explicitly where order matters.
- YAML: `load` / `dump` from `js-yaml` (v5, safe by default). Pass strings to `load`, not Buffers,
  and do not pass `load` directly to `Array#map` (the index would become its options argument).
- CLI prompts use inquirer's `select` / `input` types (`list` no longer exists). Keep the order of
  existing choices stable: CLI tests navigate with arrow keys.
- yargs: `bump` uses `-v` / `--version` for the target version, so yargs' built-in version flag is
  disabled only inside the `bump` builder. Declare positionals with `type: 'string'` so numeric
  component IDs stay strings.
- No new runtime dependencies without a strong reason; the package is small on purpose.

## Tests

- Put API behaviour in `test/specs/api`, CLI wiring in `test/specs/cli`. Every bug fix gets a test
  that fails without the fix; every feature gets tests for its main path and its error path.
- Tests create projects under `tmpTest/` (git-ignored) via `test/factories`. Some specs
  `process.chdir()` into a test project; always restore the cwd in `afterEach`.
- Date-dependent tests use `jest.useFakeTimers({ now: new Date(...) })` and `jest.useRealTimers()`.
- CLI tests call `runCLI(cwd, args, inputs)`: it spawns `test/runSourceCLI.cjs` and sends each input
  once the prompt has rendered (stdout idle for 500 ms). Use `CLIButtons` for arrow keys and enter.
  Expect about 5 to 10 seconds per interactive CLI test.
- Snapshots exist for API output. Update them (`-u`) only when the output change is intended, and
  review the snapshot diff.
- Do not skip, `.only` or weaken tests to get green.
- The Jest suite only runs on POSIX systems: fixtures use `:` in file names (to test the migration)
  and some tests delete their own cwd. Windows is covered by `test/smoke.cjs` in CI.

## Changelog entries (required)

strangelog maintains its own changelog in `changelog/`. Every user-visible change (feature, fix,
behaviour change, removal) needs an entry in `changelog/next/`. Components are defined in
`.strangelogrc`: `api`, `cli`, `all`. Kinds: see above. Pure refactors, test-only and CI-only
changes need no entry.

Create entries with the CLI from source. Pass all flags so that it does not prompt:

```sh
yarn start add --kind fix --component cli --description "Describe the change for users"
```

Commit the generated YAML file. Never edit entries in released version directories, and never run
`strangelog bump` or change the `version` in `package.json`: releases are a maintainer decision.
`CHANGELOG.md` in the root is a generated artifact.

## Dependencies

- Upgrade with `yarn upgrade <pkg>@<version>` (or edit `package.json` and run `yarn install`), then
  commit `package.json` and `yarn.lock` together. CI installs with `--frozen-lockfile`.
- Use stable releases only. Check peer dependency ranges before upgrading ESLint or its plugins:
  `eslint-plugin-import-x`, `@stylistic/eslint-plugin`, `typescript-eslint` and
  `eslint-import-resolver-typescript` must all support the ESLint major.
- TypeScript is pinned to the newest version that `typescript-eslint` and `ts-jest` support (see
  their `typescript` peer ranges). TypeScript 7 (the native port) has no JavaScript API yet, so
  those tools cannot use it; upgrade only once both support it.
- `ts-jest` is the Jest transform; `tsx` runs the CLI from source (`yarn start`,
  `test/runSourceCLI.cjs`). Babel is not used.

## CI, branches and merging

- GitHub Actions (`.github/workflows/ci.yml`): `ci (22.x)`, `ci (24.x)`, `ci (26.x)` run
  `yarn ci-pipeline` plus the compiled-CLI smoke test on Ubuntu; `windows-smoke` runs the smoke test
  on Windows. All four are required status checks on `master`.
- `master` is protected: work on a branch (`feat/...`, `fix/...`, `docs/...`), open a PR with
  `Closes #<issue>` where applicable, and merge only with green checks and an approving review.
  Do not force-push to `master`.
- Commit messages: imperative subject line, short body explaining why. Keep unrelated changes in
  separate commits.

## Common pitfalls

- Testing only through Jest: ts-jest and tsx compile `src/` on their own, so a broken `lib/` build
  is invisible to `yarn test-ci`. Run `yarn compile && node test/smoke.cjs`.
- ts-jest only transpiles (`isolatedModules`), so Jest passes even with type errors. Type errors
  only show up in `yarn typecheck`, which is part of `yarn ci-pipeline`.
- Node.js' built-in type stripping cannot run `src/` directly: it does not resolve the
  extensionless relative imports. Use `yarn start` (tsx) or the compiled `lib/`.
- `getProjectConfig()` and `getPossibleNextVersions()` / `getAutomaticNextVersion()` read
  `.strangelogrc` and `package.json` from `process.cwd()`, not from the changelog path.
- A project without `info.yml` but with entry files is treated as pre-`info.yml` (format version
  `-1`); `addEntry()` writes `info.yml` first so new projects never hit that path.
