# Importing in your project

## Table of Contents

<!-- toc -->

- [From a CDN](#from-a-cdn)
- [Inside a project with a bundler](#inside-a-project-with-a-bundler)

<!-- tocstop -->

## From a CDN

If you just want to quickly try out the web component, you can get it from a
[CDN](https://cdn.jsdelivr.net/npm/@frameright/image-display-control-web-component/):

```html
<html>
  <head>
    <!-- Polyfill for Safari, see https://github.com/ungap/custom-elements -->
    <script src="https://unpkg.com/@ungap/custom-elements/es.js"></script>
  </head>

  <body>
    <img
      is="image-display-control"
      src="https://webc.frameright.io/assets/pics/skater.webp"
      width="200"
      height="200"
      data-image-regions='[{
        "id": "horizontalbanner",
        "names": ["Horizontal banner"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2343",
        "y": "858",
        "width": "3417",
        "height": "1281"
      }, {
        "id": "square",
        "names": ["Square"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2462",
        "y": "1097",
        "width": "782",
        "height": "782"
      }, {
        "id": "tallportrait",
        "names": ["Tall portrait"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2345",
        "y": "850",
        "width": "1122",
        "height": "2990"
      }]'
    />

    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@frameright/image-display-control-web-component@1.0.0/dist/image-display-control.min.js"
    ></script>
  </body>
</html>
```

## Inside a project with a bundler

Provided that you are using a bundler (e.g. [Webpack](https://webpack.js.org/)
or [Rollup](https://rollupjs.org/)), you can add the web component to your
project with:

```bash
npm install @frameright/image-display-control-web-component
```

and then import it in your front-end code with:

```js
import "@frameright/image-display-control-web-component/image-display-control.js";
```
