# Browser support

## Table of Contents

<!-- toc -->

- [Overview](#overview)
- [`ResizeObserver` polyfill](#resizeobserver-polyfill)
- [Missing CSS `contain`](#missing-css-contain)

<!-- tocstop -->

## Overview

The web component relies on a few browser features, the most recently
implemented being:

* [CSS `inset()`](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/inset)
  (Chrome 37+, Firefox 54+, Safari 10.1+, 2017+)
* [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
  (Chrome 64+, Firefox 69+, Safari 13.1+, 2020+)
* [CSS `contain`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
  (Chrome 52+, Firefox 69+, Safari 15.4+, 2022+)

If any of these features are not supported by the browser, the web component
will disable itself and fall back to behaving like a standard `<img>` tag.

This behavior can be simulated by setting the `data-disabled="all"` HTML
attribute. See the [Attribute reference](../reference/attributes.md) for more
information.

## `ResizeObserver` polyfill

In order to increase browser support, you can ship your web application with a
[`ResizeObserver` polyfill](https://github.com/juggle/resize-observer). If your
project is using a bundler (e.g. [Webpack](https://webpack.js.org/) or
[Rollup](https://rollupjs.org/)), add the polyfill to your project with:

```bash
npm install @juggle/resize-observer
```

and set it up right where you import the web component:

```js
import "@frameright/image-display-control-web-component/dist/image-display-control.js";

// This is a ponyfill, i.e. a polyfill that doesn't touch the global window
// object by default, see https://github.com/juggle/resize-observer
import { ResizeObserver as ResizeObserverPonyfill } from '@juggle/resize-observer';
window.ResizeObserver = window.ResizeObserver || ResizeObserverPonyfill;
```

## Missing CSS `contain`

Even if the browser does not support the `contain` CSS property, it is possible
to make use of the web component by telling it what to do instead when this
browser feature isn't available. This can be done by setting the
`data-css-contain-fallback=` HTML attribute. See the
[Attribute reference](../reference/attributes.md) for more information.
