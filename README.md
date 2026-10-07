# strangelog

[![CI](https://github.com/neXenio/strangelog/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/neXenio/strangelog/actions/workflows/ci.yml)

Manage your changelog via CLI – painless, merge-conflict free, CI-friendly.

## Getting Started

Requires Node.js `^22.18.0` or `>=24.11.0`.

For yarn users: `yarn add --dev @nexenio/strangelog`

For npm users: `npm install --save-dev @nexenio/strangelog`

From version 3.0.0 strangelog is published as `@nexenio/strangelog`. The unscoped `strangelog` package on npm stays at 2.0.2. The command is still called `strangelog`.

Done.

## Configuration

strangelog reads an optional `.strangelogrc` (YAML) from your project root:

```yaml
# where changelog entries are stored (default: ./changelog)
path: ./changelog
# optional components an entry can refer to: ID -> title
components:
  api: API
  cli: CLI
  # a component can also be an object; `enabled: false` keeps it for rendering
  # existing entries but no longer offers it in `strangelog add`
  legacy:
    title: Legacy UI
    enabled: false
```

All keys are optional:

| Key | Default | Meaning |
| --- | --- | --- |
| `path` | `./changelog` | Directory of the changelog entries, relative to the project root. |
| `components` | `{}` | Map of component ID to a title or to `{ title, enabled }`. |
| `template` | `default` | Markdown template of `strangelog generate`: `default` (a section per version and kind) or `compact` (one line per entry, see below). |
| `kindLabels` | see below | Map of kind to the label the `compact` template prints. Merged over the defaults `addition: feat`, `change: change`, `fix: fix`, `removal: removal`, `deprecation: deprecation`, `security: security`. |
| `allComponentLabel` | `all` | What the `compact` template prints instead of a component for entries without one. |
| `kinds` | all kinds | List of the kinds new entries may have, e.g. `[addition, fix]`. `strangelog add` and `addEntry()` reject other kinds. Existing entries of other kinds still render. |
| `ticketUrl` | none | URL of a ticket, `{ticket}` is replaced with the ticket ID. Both templates render tickets as Markdown links with it, and as plain IDs without it. |
| `ticketPattern` | none | Regular expression that ticket IDs given to `strangelog add` must match, e.g. `^LUCA-\d+$`. |
| `legacyChangelog` | none | Path of a Markdown file whose content `strangelog generate` appends verbatim after the generated versions. A leading `# Changelog` line is left out, since the generated part has one. |

The `compact` template renders:

```markdown
# Changelog

### 1.2.0 (2026-10-07)
* **web** feat: Members see how much of their plan is left ([LUCA-36509](https://horizoncloud.atlassian.net/browse/LUCA-36509))
* **all** fix: Exports include the invoice number

### 1.1.0 (2026-10-01)
* **api** fix: Cashout failure records include trace details
```

Each line is `* **<component ID>** <kind label>: <description>`, followed by the tickets in parentheses. The date comes from the `.release.yml` that `strangelog bump` writes; versions without one are rendered without date.

A complete example, for a project that moves its hand-written `CHANGELOG.md` to strangelog without changing the format: move the old content of `CHANGELOG.md` to `changelog/legacy.md`, then

```yaml
path: ./changelog
template: compact
legacyChangelog: ./changelog/legacy.md
allComponentLabel: all
kinds: [addition, fix]
kindLabels:
  addition: feat
  fix: fix
ticketUrl: https://horizoncloud.atlassian.net/browse/{ticket}
ticketPattern: ^LUCA-\d+$
components:
  backend-pay: Backend Pay
  web-at-consumer-app: Consumer App
```

## Usage

Once installed, the strangelog command is available via `yarn run strangelog [command]` or `npm run strangelog [command]`.

### `strangelog add`

Documents a new change. For that, you will be prompted for the following information:
- the component your change refers to (if multiple `components` are defined `.strangelogrc`)
- the kind of change you did (addition, change or bug fix)
- a free text description
- optional ticket IDs, comma separated

**Example:** `yarn run strangelog add`

To add an entry without prompts (in scripts or by coding agents), pass the flags. `--component` can be left out only if no components are defined:

**Example:** `yarn run strangelog add --kind fix --component api --description "Login works with plus signs in e-mail addresses"`

Kinds: `addition`, `change`, `fix`, `removal`, `deprecation`, `security`, or the ones listed in `kinds` in `.strangelogrc`. Invalid or missing flags exit with code 2 and print the valid kinds and components.

Pass `--ticket` (`-t`) to link tickets. It can be repeated and takes comma separated IDs: `yarn run strangelog add -k fix -c api -d "Login works with plus signs" -t LUCA-1 -t LUCA-2,LUCA-3`. With `ticketPattern` in `.strangelogrc`, IDs that do not match exit with code 2.

**Note:** This adds each entry as a single file into directory called `next` inside of your changelog path. These, you need to commit to actually maintain a project changelog.

### `strangelog bump`

Takes all the entries in the `next` directory and moves them to a new version directory (e.g. `1.2.3`). It will ask you what the next version should be.

**Example:** `yarn run strangelog bump`

Pass `--version` (`-v`) to set the next version without being asked, e.g. `yarn run strangelog bump -v 1.2.3`.

`bump` also writes the release date (your local date) to `.release.yml` in the new version directory, e.g. `changelog/1.2.3/.release.yml` with `date: '2026-10-07'`. The `compact` template prints it. From the API, `bumpNextVersion('1.2.3', { date: '2026-10-07' })` sets the date explicitly.

Pass `--auto` (`-a`) to derive the next SemVer version from the `version` in your `package.json` and the entries in `next`: a major version if there is any change, otherwise a minor version if there is any addition, otherwise a patch version.

**Example:** `yarn run strangelog bump --auto`

### `strangelog generate`

Takes all changelog entries ever made in your project and generates a Markdown file at the path given via `--outFile` (e.g. `CHANGELOG.md`).

**Example:** `yarn run strangelog generate --outFile CHANGELOG.md`

Pass `--outFile -` to print to stdout instead, and `--version` (`-v`) to render only the section of one version, without the `# Changelog` header and without `legacyChangelog`. That fits release notes, e.g. for GitLab releases or chat posts:

**Example:** `yarn run strangelog generate --version 1.2.3 --outFile -`

From the API: `generate({ version: '1.2.3' })`. Use `next` for the unreleased entries.

**Note:** Since that `CHANGELOG.md` file would produce merge conflicts when working with multiple people in parallel, it is recommended that you do not commit this file (at least not in feature branches). The recommended solution is to generate the `CHANGELOG.md`-file during your CI build and publish it as an artifact.

### `strangelog rename-component <from> <to>`

Moves all entries of component `<from>`, in every version including `next`, to component `<to>`. To rename a component, add the new ID to `components` in `.strangelogrc` and run this command. To merge two components, use an existing component as `<to>`. Remove `<from>` from `.strangelogrc` afterwards if it is no longer needed.

**Example:** `yarn run strangelog rename-component frontend web`

### `strangelog migrate`

Updates the changelog files of your project to the format of the installed strangelog version and records that version in `info.yml` inside your changelog path. Run it once after upgrading strangelog.

Changelogs created before strangelog `2.0.0` contain `:` in their entry file names, which Windows cannot check out. `strangelog migrate` renames these files (e.g. `2017-09-12T13:50:07.154Z_fix_all.yml` becomes `2017-09-12T13-50-07.154Z_fix_all.yml`). Commit the renamed files so that the repository can be cloned on Windows.

**Example:** `yarn run strangelog migrate`

## AI coding agents

strangelog ships instructions for coding agents (Claude Code, Codex, Cursor, Copilot and others) in `node_modules/@nexenio/strangelog/AGENTS.md`: when to add an entry, which flags to use and what not to touch. To make agents in your project follow them, add this to your project's `AGENTS.md` (or `CLAUDE.md`):

```markdown
## Changelog

This project uses strangelog. For every user-visible change, add an entry with
`npx strangelog add --kind <kind> --component <component> --description "<what changed>"`
and commit the created file. Never run `strangelog add` without flags.
Full rules: node_modules/@nexenio/strangelog/AGENTS.md
```

## Development

Requires Yarn classic (`1.22.22`, see `packageManager` in `package.json`). `.nvmrc` pins the recommended Node.js version.

- `yarn install`: installs dependencies and compiles `src/` to `lib/`
- `yarn test-ci`: runs the Vitest test suite
- `yarn lint`: runs oxlint
- `yarn format-check`: checks the formatting with oxfmt (`yarn format` fixes it)
- `yarn typecheck`: runs the TypeScript type check
- `yarn ci-pipeline`: runs all of the above, as CI does
- `yarn start [command]`: runs the CLI from source
