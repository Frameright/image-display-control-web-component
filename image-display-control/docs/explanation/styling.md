# CSS styling

The usual ways of styling an `<img>` element are supported, e.g. `width:`,
`border:`, `padding:`, etc. However the following CSS properties have now
limitations.

## Table of Contents

<!-- toc -->

- [`object-*:`, `transform*:` and `clip-path:` properties](#object--transform-and-clip-path-properties)
- [`border:` and `padding:` properties](#border-and-padding-properties)
- [`contain:` property on the parent element](#contain-property-on-the-parent-element)

<!-- tocstop -->

## `object-*:`, `transform*:` and `clip-path:` properties

In order to zoom in on a specific region of the image, the web component will
set the following CSS properties via the `<img style="` HTML attribute:

* `object-fit:`
* `object-position:`
* `transform-origin:`
* `transform:`
* `clip-path:`

This will probably override any CSS styling you have set for these properties.
You can disable this behavior by setting the `<img data-disabled="all" />` HTML
attribute. The element will then behave like a standard `<img>` element. See the
[Attribute reference](../reference/attributes.md) for more details.

## `border:` and `padding:` properties

As long as the web component is not zoomed in on a specific region, but instead
has decided that slightly middle-cropping the image is the best option, borders
and padding will be displayed as usual. However, once the web component zooms in
on a specific region, it temporarily overrides them via
`<img style="border: none; padding: 0" />` for two reasons:

* It zooms in by applying a CSS `transform: scale(...); clip-path: ...;`, thus
  borders and padding would get pushed and clipped away anyway.
* Keeping borders and padding would make mathematical calculations for the
  zooming algorithm unnecessarily complicated.

If possible, consider wrapping the web component in a `<div>` element and
applying borders and padding to that instead.

## `contain:` property on the parent element

Zooming in on a region by using CSS `transform: scale(...); clip-path: ...;`
would normally cause an overflow and thus unwanted scrollbars. To prevent this,
the web component sets CSS `contain: paint;` on its parent element.

You can disable this behavior by setting the
`<img data-disabled="css-contain" />` HTML attribute. See the
[Attribute reference](../reference/attributes.md) for more details.
