# strangelog

[![Build Status](https://travis-ci.org/neXenio/strangelog.svg?branch=master)](https://travis-ci.org/neXenio/strangelog)

Manage your changelog via CLI – painless, merge-conflict free, CI-friendly.

## Getting Started

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

Takes all changelog entries ever made in your project and generates a Markdown file `CHANGELOG.md` in your project root.

**Example:** `yarn run strangelog generate`

**Note:** Since that `CHANGELOG.md` file would produce merge conflicts when working with multiple people in parallel, it is recommended that you do not commit this file (at least not in feature branches). The recommended solution is to generate the `CHANGELOG.md`-file during your CI build and publish it as an artifact.