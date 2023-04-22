[<img src="https://avatars.githubusercontent.com/u/35964478?s=200&v=4" align="right" width="64" height="64">](https://frameright.io)
[![npm version](https://img.shields.io/npm/v/@frameright/image-display-control-web-component)](https://www.npmjs.com/package/@frameright/image-display-control-web-component)
[![validate-on-push](https://github.com/Frameright/image-display-control-web-component/actions/workflows/validate-on-push.yml/badge.svg)](https://github.com/Frameright/image-display-control-web-component/actions/workflows/validate-on-push.yml)

&nbsp;

<!-- Note: make sure all URLs in this document are absolute, and not relative
     within GitHub, as we are publishing this file to NPM and want URLs to
     remain valid there. -->

# `<img is="image-display-control">`

## Image Display Control Web Component

An easy way to do [Image Display Control](https://frameright.io) in your HTML
page. Made with :heart: by [Frameright](https://frameright.io). Power to the
pictures!

&emsp; :sparkles: [Live mobile demo](https://webc.frameright.io)

### Table of Contents

<!-- toc -->

- [Overview](#overview)
  * [Without this web component](#without-this-web-component)
  * [Basic usage](#basic-usage)
- [Image Display Control metadata](#image-display-control-metadata)
- [Installation](#installation)
- [Usage](#usage)
- [Local demo](#local-demo)
- [Dependency tree / credits](#dependency-tree--credits)
- [Browser support](#browser-support)
- [Changelog](#changelog)

<!-- tocstop -->

### Overview

#### Without this web component

When an image is too big for its `<img>` HTML element, the best option browsers
offer nowadays is to use the
[`object-fit: cover;`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
CSS property in order to scale and middle-crop it:

<img src="https://raw.githubusercontent.com/Frameright/image-display-control-web-component/main/image-display-control/docs/assets/middlecrop.png" align="right">

```html
<img
  src="https://images.pexels.com/photos/3625715/pexels-photo-3625715.jpeg"
  width="200"
  height="200"
  style="object-fit: cover;"
/>
```

This is less than optimal, as there might be, in the example above, a better
square-ish region in the image that could be displayed instead of the
middle-crop.

#### Basic usage

This web component extends the `<img>` tag with the ability to accept a list of
image regions, and to zoom in on the best one for the current element size:

<img src="https://raw.githubusercontent.com/Frameright/image-display-control-web-component/main/image-display-control/docs/assets/oneanimal.png" align="right">

```html
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
```

The resulting HTML element is
[responsive](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
and will automatically reassess the best region to zoom in on when it gets
resized, e.g. when the user turns their phone from portrait to landscape.

&emsp; :sparkles: [Live mobile demo](https://webc.frameright.io)

### Image Display Control metadata

Nowadays an image file (e.g. JPEG, PNG) can contain this type of image regions
in their metadata according to
[the IPTC standard](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#image-region).
The back-end would typically be responsible for extracting them from the image
file and placing them in the front-end's `<img data-image-regions="` attribute.
This is for example what
[this WordPress plugin](https://wordpress.org/plugins/image-display-control/)
does, with the help of
[a PHP library](https://github.com/Frameright/php-image-metadata-parser) for
extracting image metadata. This can also be achieved on a Node.js back-end with
the help of
[this TypeScript library](https://github.com/Frameright/image-display-control-metadata-parser).

Photographers, or anyone else, can use the
[Frameright app](https://frameright.app/) to define and store image regions in
the metadata of their pictures.

### Installation

Provided that you are using a bundler (e.g. [Webpack](https://webpack.js.org/)
or [Rollup](https://rollupjs.org/)), you can add the web component to your
project with:

```bash
npm install @frameright/image-display-control-web-component
```

or get it from a
[CDN](https://cdn.jsdelivr.net/npm/@frameright/image-display-control-web-component/):

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@frameright/image-display-control-web-component@0.1.0/dist/image-display-control.min.js"
></script>
```

&emsp; :floppy_disk:
[Importing in your project](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/explanation/importing.md)

### Usage

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

### Local demo

To run a local development server that serves the basic demo located in
[`demo/`](demo/), run:

```bash
npm install
npm start
```

![Demo](https://raw.githubusercontent.com/Frameright/image-display-control-web-component/main/image-display-control/docs/assets/demo.gif)

&emsp; :wrench: [Contributing](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/contributing.md)

&emsp; :sparkles: [Live mobile demo](https://webc.frameright.io)

### Dependency tree / credits

- [ungap/custom-elements](https://github.com/ungap/custom-elements), a polyfill
  for web components on Safari. Many thanks to
  [WebReflection](https://github.com/WebReflection)!

### Browser support

From scratch the web component should work on:

* Chrome 64+ (2018)
* Firefox 69+ (2019)
* Safari 15.4+ (2022)

More support can be achieved with a few tweaks:

&emsp; :mag: [Browser support](https://github.com/Frameright/image-display-control-web-component/blob/main/image-display-control/docs/explanation/browsers.md)

### Changelog

**0.1.0** (2023-03-03):
  * Added `data-avoid-no-region=` attribute.
  * Added
    [debounce function](https://davidwalsh.name/javascript-debounce-function)
    when setting the `sizes=` attribute in order to avoid blinking on Chrome.

**0.0.9** (2023-02-20):
  * Implemented overriding responsively the `sizes=` attribute in order to fetch
    an image from the `srcset=` attribute that has a high enough resolution for
    the region we're zooming in.

**0.0.8** (2023-02-16):
  * Fixed race condition when the image takes time to load.

**0.0.7** (2023-02-09):
  * Added handling of missing browser features.
  * Added `data-css-contain-fallback=` attribute.

**0.0.6** (2023-02-07):
  * Removed [Safari polyfill](https://github.com/ungap/custom-elements) from
    minified bundle to be served on CDNs.

**0.0.5** (2023-02-07):
  * Implemented `data-debug-draw-regions=` attribute.
  * Added `dist/image-display-control.min.js` to NPM package in order for it to
    be served on CDNs like [jsDelivr](https://www.jsdelivr.com/).
  * Fixed a bug where `data-disabled=none` would be ignored.

**0.0.4** (2023-02-02):
  * Improved NPM documentation.

**0.0.3** (2023-02-02):
  * Improved NPM documentation.

**0.0.2** (2023-02-02):
  * Improved NPM documentation.

**0.0.1** (2023-02-02):
  * Initial version.
