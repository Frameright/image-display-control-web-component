[![validate-on-push](https://github.com/AurelienLourot/frameright-web-component/actions/workflows/validate-on-push.yml/badge.svg)](https://github.com/AurelienLourot/frameright-web-component/actions/workflows/validate-on-push.yml)

[<img src="https://avatars.githubusercontent.com/u/35964478?s=200&v=4" align="left" width="64" height="64">](https://frameright.io)

# Frameright Web Component

An easy way to leverage Image Display Control metadata in your DOM. Made with
:heart: by [Frameright](https://frameright.io). Power to the pictures!

> **WARNING**: not fully implemented yet

## Basic Usage

```html
<img-frameright
    src="./my-image-with-two-dogs-and-a-cat.jpg"
    alt="My image with two dogs and a cat"
    image-regions='[{
        "id": "cat",
        "names": ["Cat"],
        "shape": "rectangle",
        "absolute": false,
        "x": "0.31",
        "y": "0.18",
        "height": "0.385",
        "width": "0.127"
     }]'
></img-frameright>
```

&emsp; :airplane: [Advanced usage](img-frameright/)
