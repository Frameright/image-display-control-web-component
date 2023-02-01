[![validate-on-push](https://github.com/AurelienLourot/frameright-web-component/actions/workflows/validate-on-push.yml/badge.svg)](https://github.com/AurelienLourot/frameright-web-component/actions/workflows/validate-on-push.yml)

[<img src="https://avatars.githubusercontent.com/u/35964478?s=200&v=4" align="left" width="64" height="64">](https://frameright.io)

# Image Display Control Web Component

An easy way to do [Image Display Control](https://frameright.io) in your HTML
page. Made with :heart: by [Frameright](https://frameright.io). Power to the
pictures!

## Table of Contents

<!-- toc -->

- [Without this web component](#without-this-web-component)
- [Basic usage](#basic-usage)
- [Dependency tree / credits](#dependency-tree--credits)

<!-- tocstop -->

## Without this web component

When an image is too big for its `<img>` HTML element, the best option browsers
offer nowadays is to use the
[`object-fit: cover;`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
CSS property in order to scale and middle-crop it:

<table style="border: none;"><tr style="border: none;">
<td style="border: none;"><pre>
&lt;img
  src="https://images.pexels.com/photos/3625715/pexels-photo-3625715.jpeg"
  width="200"
  height="200"
  style="object-fit: cover;"
/&gt;
</pre></td>
<td style="border: none;"><img src="docs/assets/middlecrop.png"></td>
</tr></table>

This is less than optimal, as there might be, in the example above, a better
square-ish region in the image that could be displayed instead of the
middle-crop.

## Basic usage

This web component extends the `<img>` tag with the ability to accept a list of
image regions, and to zoom in on the best one for the current element size:

<table style="border: none;"><tr style="border: none;">
<td style="border: none;"><pre>
&lt;img
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
/&gt;
</pre></td>
<td style="border: none;"><img src="docs/assets/oneanimal.png"></td>
</tr></table>

The resulting HTML element is
[responsive](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
and will automatically reassess the best region to zoom in on when it gets
resized, e.g. when the user turns their phone from portrait to landscape.

![Demo](image-display-control/docs/assets/demo.gif)

&emsp; :airplane: [Usage](image-display-control/)

## Dependency tree / credits

- [ungap/custom-elements](https://github.com/ungap/custom-elements), a polyfill
  for web components on Safari. Many thanks to
  [WebReflection](https://github.com/WebReflection)!
