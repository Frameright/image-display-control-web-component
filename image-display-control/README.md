<!-- Note: make sure all URLs in this document are absolute, and not relative
     within GitHub, as we are publishing this file to NPM and want URLs to
     remain valid there. -->

# `<img is="image-display-control" />`

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
- [Local demo](#local-demo)
- [Changelog](#changelog)

<!-- tocstop -->

## Installation

Provided that you are using a bundler (e.g. [Webpack](https://webpack.js.org/)
or [Rollup](https://rollupjs.org/)), you can add the web component to your
project with:

```bash
npm install @frameright/image-display-control-web-component
```

&emsp; :floppy_disk:
[Importing in your project](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/explanation/importing.md)

## Usage

```html
<html>
  <head></head>
  <body>
    <img
      is="image-display-control"
      src="https://images.pexels.com/photos/3625715/pexels-photo-3625715.jpeg"
      width="200"
      height="200"
      data-image-regions='[{
        "id": "oneanimal",
        "names": ["One animal"],
        "shape": "rectangle",
        "unit": "relative",
        "x": "0.217",
        "y": "0.708",
        "width": "0.239",
        "height": "0.1467"
      }, {
        "id": "threeanimals",
        "names": ["Three animals"],
        "shape": "rectangle",
        "unit": "relative",
        "x": "0.245",
        "y": "0.725",
        "width": "0.419",
        "height": "0.121"
      }]'
    />
    <!-- Built with Webpack or Rollup. Contains the web component: -->
    <script src="mybundle.js"></script>
  </body>
</html>
```

&emsp; :airplane:
[Advanced usage](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/usage.md)

## Local demo

To run a local development server that serves the basic demo located in
[`demo/`](demo/), run:

```bash
npm install
npm start
```

![Demo](https://raw.githubusercontent.com/Frameright/image-display-control-web-component/main/image-display-control/docs/assets/demo.gif)

&emsp; :wrench: [Contributing](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/contributing.md)

## Changelog

**0.0.1** (2023-02-02):
  * Initial version.
