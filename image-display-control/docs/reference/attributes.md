# Attribute reference

For a more high-level overview of the attributes, see the
[Attributes](../explanation/attributes.md) page.

<!-- toc -->

- [`data-image-regions=`](#data-image-regions)
- [`data-image-region-id=`](#data-image-region-id)
- [`data-disabled=`](#data-disabled)
- [`data-loglevel=`](#data-loglevel)
- [`data-debug-draw-regions=`](#data-debug-draw-regions)

<!-- tocstop -->

## `data-image-regions=`

Type: string.

JSON-formatted array of regions, a region being an object with the
following properties:

* `id`: string. Identifier for the region. Unique within the array of regions.
* `names`: array of strings. Names for the region, possibly in different
  languages.
* `shape`: string. Only supported value for now: `rectangle`.
* `unit`: string. Unit of the `x`, `y`, `width` and `height` properties.
  Supported values:
  * `relative`: Unit is a floating-point number (or numeric string) between 0
    and 1, representing a coordinate or length relative to the image size.
  * `pixel`: Unit is a positive integer number (or numeric string), representing
    a coordinate or length in pixels, relative to the size specified by the
    `imageWidth` and `imageHeight` properties.
* `imageWidth`: positive integer number (or numeric string). Reference width to
  be used as a base for `x` and `width` when `unit` is `pixel`.
* `imageHeight`: positive integer number (or numeric string). Reference height
  to be used as a base for `y` and `height` when `unit` is `pixel`.
* `x`: X coordinate of the region.
* `y`: Y coordinate of the region.
* `width`: Width of the region.
* `height`: Height of the region.

> **NOTE**: when the
> [`srcset=`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset)
> and `sizes=` attributes are used, we have several source images with different
> resolutions. When stating e.g. `unit=pixel` and `x=50` it would be impossible
> for the web component to know from which of all the supported resolutions the
> `x` value relates to. Thus the attributes `imageWidth` and `imageHeight`.

## `data-image-region-id=`

Type: string.

Uniquely identifies a region within `data-image-regions=`. If set, the web
component will zoom in on the region with the matching `id` property, no matter
what. If not set, the web component will zoom in on the region that best fits
the current element size.

To force the web component not to zoom in on any region, essentially behaving
like a standard `<img>` tag with `object-fit: cover`, you can set this attribute
to `data-image-region-id="<no region>"`. This is essentially the same as setting
`data-disabled="all"`, although the CSS containment will still be applied.

## `data-disabled=`

Type: string.

Supported values:

* `none` (default): No functionality disabled. The web component will behave as
  expected.
* `all`: All functionality disabled. The web component will behave like a
  standard `<img>` tag.
* `css-contain`: CSS containment disabled. The web component will behave as
  expected, but will not set CSS containment on its parent element, which may
  lead to rogue scrollbars.

> **NOTE**: The web component uses CSS `transform*` and `clip-path` properties
> in order to zoom in on a region, which would normally cause an overflow and
> thus unwanted scrollbars. To prevent this, the web component sets
> [CSS containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment)
> (`contain: paint;`) on its parent element.

## `data-loglevel=`

Type: string.

Logging level for console output. Supported values:

* `off` (default): No console output.
* `fatal`: Only fatal messages.
* `error`: Only error and fatal messages.
* `warn`: Only warning, error and fatal messages.
* `info`: Only info, warning, error and fatal messages.
* `debug`: All messages.

## `data-debug-draw-regions=`

Type: string.

Whether or not to draw the image regions as an overlay on top of the image, for
debugging purposes. Supported values:

* `off` (default): No drawing.
* `on`: Drawing is performed by creating sibling `<div>` elements, giving them
  a border and letting them overlay the image.

> **NOTE**: this will only work if:
>
> * The web component is not in `data-disabled="all"` mode.
> * The web component is at the top-right corner of its parent element.
