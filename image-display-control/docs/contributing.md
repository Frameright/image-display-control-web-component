# Contributing

## Table of Contents

<!-- toc -->

- [:floppy_disk: Code formatting](#floppy_disk-code-formatting)
- [:memo: Validating](#memo-validating)
  * [Running the unit tests](#running-the-unit-tests)
  * [Running the local demo](#running-the-local-demo)
- [:bookmark_tabs: Documenting](#bookmark_tabs-documenting)
  * [Spellchecking the documentation](#spellchecking-the-documentation)
  * [(Re-)generating tables of contents](#re-generating-tables-of-contents)
- [:gift: Releasing](#gift-releasing)
  * [Version number](#version-number)
  * [Changelog](#changelog)
  * [Last tweaks and checks](#last-tweaks-and-checks)
  * [Git tag](#git-tag)
  * [Build the package locally](#build-the-package-locally)
  * [Publish the package to NPM](#publish-the-package-to-npm)

<!-- tocstop -->

## :floppy_disk: Code formatting

Pull and run [ESLint](https://eslint.org/) and
[prettier](https://github.com/prettier/prettier) with:

```bash
npm install
npm run lint    # check for errors
npm run format  # fix errors
```

## :memo: Validating

### Running the unit tests

Pull and run
[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) with:
  
```bash
npm install
npm run test        # run once
npm run test:watch  # interactive watch mode
```

### Running the local demo

Pull and run [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/)
in order to serve and run [`../demo/`](../demo/) with:

```bash
npm install
npm start  # interactive watch mode
```

&emsp; :sparkles: [Live mobile demo](https://frameright.lourot.dev)

## :bookmark_tabs: Documenting

### Spellchecking the documentation

Pull and run [`mdspell`](https://github.com/lukeapage/node-markdown-spellcheck)
with:

```bash
npm install
npm run spellcheck
```

### (Re-)generating tables of contents

Pull and run [`markdown-toc`](https://github.com/jonschlinkert/markdown-toc)
with:

```bash
npm install
npm run gentoc
```

## :gift: Releasing

### Version number

Choose the next version number according to the rules of
[Semantic Versioning](https://semver.org/) and set it in
[package.json](../package.json).

### Changelog

Describe the changes made compared to the last released version in the
[changelog](../README.md). Browse the git history to make sure nothing has
been left out.

### Last tweaks and checks

Format and validate the source one last time:

```bash
npm run format
npm run gentoc
npm run spellcheck
npm run test
```

Commit and push any local changes:

```bash
git add -A
git commit -m "<my message>"
git push
```

### Git tag

In the rest of this document we'll assume you are releasing version `1.2.3`.
Create a git tag for the version you are releasing by running:

```bash
git tag 1.2.3
git push --tags
```

### Build the package locally

Build the package locally by running:

```bash
npm pack
```

And check that the resulting
`frameright-image-display-control-web-component-1.2.3.tgz` looks well-formed.
Finally clean up by running:

```bash
rm frameright-image-display-control-web-component-1.2.3.tgz
```

### Publish the package to NPM

```bash
npm login --scope=@frameright
npm publish
```

> **NOTE**: on the first publication do `npm publish --access public` instead.

And check that the package looks well-formed at
`https://www.npmjs.com/package/@frameright/image-display-control-web-component/v/1.2.3`.