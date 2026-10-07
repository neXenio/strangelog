# strangelog

[![CI](https://github.com/neXenio/strangelog/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/neXenio/strangelog/actions/workflows/ci.yml)

Manage your changelog via CLI – painless, merge-conflict free, CI-friendly.

## Getting Started

Requires Node.js `^22.18.0` or `>=24.11.0`.

For yarn users: `yarn add --dev strangelog`

For npm users: `npm install --save-dev strangelog`

Done.

## Usage

Once installed, the strangelog command is available via `yarn run strangelog [command]` or `npm run strangelog [command]`.

### `strangelog add`

Documents a new change. For that, you will be prompted for the following information:
- the component your change refers to (if multiple `components` are defined `.strangelogrc`)
- the kind of change you did (addition, change or bug fix)
- a free text description

**Example:** `yarn run strangelog add`

**Note:** This adds each entry as a single file into directory called `next` inside of your changelog path. These, you need to commit to actually maintain a project changelog.

### `strangelog bump`

Takes all the entries in the `next` directory and moves them to a new version directory (e.g. `1.2.3`). It will ask you what the next version should be.

**Example:** `yarn run strangelog bump`

### `strangelog generate`

Takes all changelog entries ever made in your project and generates a Markdown file at the path given via `--outFile` (e.g. `CHANGELOG.md`).

**Example:** `yarn run strangelog generate --outFile CHANGELOG.md`

**Note:** Since that `CHANGELOG.md` file would produce merge conflicts when working with multiple people in parallel, it is recommended that you do not commit this file (at least not in feature branches). The recommended solution is to generate the `CHANGELOG.md`-file during your CI build and publish it as an artifact.

## Development

Requires Yarn classic (`1.22.22`, see `packageManager` in `package.json`). `.nvmrc` pins the recommended Node.js version.

- `yarn install`: installs dependencies and compiles `src/` to `lib/`
- `yarn test-ci`: runs the Jest test suite
- `yarn lint`: runs ESLint
- `yarn flow`: runs the Flow type check
- `yarn ci-pipeline`: runs all of the above, as CI does
- `yarn start [command]`: runs the CLI from source
