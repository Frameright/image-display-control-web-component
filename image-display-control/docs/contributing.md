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
