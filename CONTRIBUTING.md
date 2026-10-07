# Contributing

How to work on this repository, for humans and AI coding agents. `README.md` describes strangelog
for its users; this file describes how to change it.

## What this project is

strangelog is a small npm package (CLI + JavaScript API) for file-based changelogs. Every change is
one YAML file in `changelog/next/`, so parallel branches never conflict on a changelog file.
`bump` moves `next/` into a version directory and `generate` renders all entries to Markdown.

- Public JS API: `require('strangelog')` -> `index.js` -> `lib/index.js` -> `connectChangelog(config)`
  plus `CURRENT_VERSION` and the Flow types from `src/types.js`.
- CLI binary: `strangelog` -> `lib/cli/index.js`.
- `lib/` is build output (git-ignored). Edit `src/`, never `lib/`.

Keep both surfaces backwards compatible: consumer projects have years of entry files and
`.strangelogrc` files in the formats described below.

## Setup and commands

Requirements: Node.js `^22.18.0 || >=24.11.0` (`.nvmrc` = 24) and Yarn classic `1.22.22`
(`packageManager` in `package.json`). Do not switch package managers or commit a `package-lock.json`.

| Command | What it does |
| --- | --- |
| `yarn install --frozen-lockfile` | installs dependencies; `prepare` compiles `src/` to `lib/` |
| `yarn compile` | Babel build `src/` -> `lib/` (CommonJS) |
| `yarn test-ci` | full Jest suite, `--runInBand` |
| `yarn jest --config=jest.config.json <file>` | run one spec file (prefer this while iterating) |
| `yarn lint` / `yarn lint-fix` | ESLint (flat config in `eslint.config.mjs`) |
| `yarn flow` | Flow type check (`flow check`) |
| `yarn ci-pipeline` | tests + lint + Flow, exactly what CI runs |
| `node test/smoke.cjs` | smoke test of the compiled `lib/` (run `yarn compile` first) |
| `yarn start <command>` | run the CLI from source, e.g. `yarn start --help` |

A change is done when `yarn ci-pipeline` passes, `yarn compile && node test/smoke.cjs` passes, and
the change has a changelog entry (see below).

## Repository layout

```
src/
  index.js                  package entry: re-exports src/api and src/types
  types.js                  shared Flow types (ConfigType, EntryType, ChangelogAPIType, ...)
  getProjectConfig.js       reads .strangelogrc (YAML) from the cwd, merges defaults
  api/
    connectChangelog.js     binds config to all API functions; the public API object
    addEntry.js             writes next/<ISO-date>_<kind>_<component>.yml
    bumpNextVersion.js      renames next/ to <version>/
    getChangelogData.js     reads all versions and entries, grouped by kind
    getSortedChangelogVersions.js
    getPossibleNextVersions.js / getAutomaticNextVersion.js   version suggestions for bump
    renameComponent.js      moves entries between components
    generate.js             renders Markdown via templates/defaultTemplate.js
    changelogInfo.js        info.yml (format version) handling
    migrate.js + migrations/  on-disk format migrations
    utils.js                globPaths, component helpers, string helpers
  cli/
    index.js                bin entry (shebang)
    cli.js                  yargs command definitions
    commands/*.js           one file per command; prompts via inquirer
  templates/defaultTemplate.js
test/
  specs/api/*.spec.js       API tests
  specs/cli/*.spec.js       CLI tests (spawn the CLI from source)
  factories/                test project / changelog fixtures
  utils.js                  runCLI(), YAML/glob helpers
  runSourceCLI.cjs          CLI entry for tests (@babel/register pinned to the repo root)
  smoke.cjs                 smoke test of the compiled lib/
flow-typed/                 hand-written libdefs for Node and Jest globals
changelog/                  this project's own changelog (strangelog dogfoods itself)
```

## On-disk formats (do not break)

- `.strangelogrc` (YAML, project root, optional): `path` (default `./changelog`) and `components`,
  a map of component ID to either a title string or `{ title, enabled }`. `enabled: false` hides a
  component from `strangelog add` but keeps rendering its entries. Always accept both forms; use
  `getComponentTitle()` / `isComponentEnabled()` from `src/api/utils.js` instead of reading values
  directly.
- Entry files: `<changelog path>/<version or next>/<date>_<kind>_<component or "all">.yml` with
  `dateTime` (ISO string, quoted), `component` (ID or `null`), `kind`, `description`. The date part
  uses `-` instead of `:` so that Windows can check out the files.
- Kinds: `addition`, `change`, `fix`, `removal`, `deprecation`, `security`. They are listed in
  `src/types.js` (`EntryKindType`), `src/api/getChangelogData.js`, `src/templates/defaultTemplate.js`
  and `src/cli/commands/add.js`. Keep these four places in sync.
- `info.yml` in the changelog path stores the format version (`version: <n>`). `n` is the number of
  migrations in `src/api/migrations/index.js` (`CURRENT_VERSION`).

### Adding a migration

Only when the on-disk format changes. Add `src/api/migrations/<n>_<name>.js` exporting a
`(config) => void`, append it to the array in `migrations/index.js` (this bumps `CURRENT_VERSION`),
add tests to `test/specs/api/migrate.spec.js`, and document the user-visible effect in the README
(`strangelog migrate`). Migrations must be idempotent per file and must never delete entries.

## Code conventions

- Every source and test file starts with `// @flow`. Annotate exported functions; Flow requires
  annotations on module exports and on parameters it cannot infer.
- Flow syntax must be parseable by `@babel/preset-flow`: use `(value: Type)` annotations, not
  `value as Type` casts. Type parameter bounds use `<T extends Bound>`. Use `unknown`, not the
  deprecated `mixed`. `$FlowFixMe` needs an error code (`$FlowFixMe[incompatible-type]`) and a
  reason; prefer fixing the type.
- `node_modules` are `[untyped]` in `.flowconfig`. New Node built-ins (e.g. another `path` function)
  must be declared in `flow-typed/node.js`; new Jest globals/matchers in `flow-typed/jest.js`.
  flow-typed's published `node`/`jest` libdefs do not parse with current Flow, so do not install them.
- ESLint enforces the style; run `yarn lint-fix` and then read the result, since some fixes (for
  example `object-property-newline`) produce awkward layouts that are better rewritten by hand.
  Notable rules: single quotes, semicolons, max line length 100, `func-style: declaration`,
  a blank line after variable declarations and before `return`, `import-x/order` with blank lines
  between import groups, no CommonJS in `.js` files (use `.cjs` for plain Node scripts),
  `no-undefined`, no nested ternaries.
- ES modules in `src/`; Babel compiles them to CommonJS. Keep `"modules": "commonjs"` in
  `.babelrc`: without it Babel 8 leaves `import` statements in `lib/` and the published package
  breaks while all tests still pass.
- Globbing: use `globPaths()` from `src/api/utils.js`, not `globSync` directly. It sets
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

`strangelog add` is interactive and needs a TTY. Agents create entries through the compiled API:

```sh
yarn compile
node -e "
const { connectChangelog } = require('./lib/api');
const getProjectConfig = require('./lib/getProjectConfig').default;
connectChangelog(getProjectConfig()).addEntry({
  component: 'cli',
  kind: 'fix',
  description: 'Describe the change for users, at least 10 characters'
});
"
```

Commit the generated YAML file. Never edit entries in released version directories, and never run
`strangelog bump` or change the `version` in `package.json`: releases are a maintainer decision.
`CHANGELOG.md` in the root is a generated artifact.

## Dependencies

- Upgrade with `yarn upgrade <pkg>@<version>` (or edit `package.json` and run `yarn install`), then
  commit `package.json` and `yarn.lock` together. CI installs with `--frozen-lockfile`.
- Use stable releases only. Check peer dependency ranges before upgrading ESLint or its plugins:
  `eslint-plugin-import-x`, `@stylistic/eslint-plugin` and `hermes-eslint` must all support the
  ESLint major. The abandoned `eslint-plugin-flowtype`/`ft-flow` plugins are intentionally unused.
- `@babel/register` is only used by the tests; `@babel/node` by `yarn start`.

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

- Testing only through Jest: Jest and `@babel/register` compile to CommonJS on their own, so a
  broken `lib/` build is invisible to `yarn test-ci`. Run `yarn compile && node test/smoke.cjs`.
- `@babel/register` only compiles files inside its `cwd`; that is why CLI tests use
  `test/runSourceCLI.cjs` instead of `babel-node` from the test project directory.
- `getProjectConfig()` and `getPossibleNextVersions()` / `getAutomaticNextVersion()` read
  `.strangelogrc` and `package.json` from `process.cwd()`, not from the changelog path.
- A project without `info.yml` but with entry files is treated as pre-`info.yml` (format version
  `-1`); `addEntry()` writes `info.yml` first so new projects never hit that path.
