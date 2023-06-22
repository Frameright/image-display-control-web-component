# Attribute reference

For a more high-level overview of the attributes, see the
[Attributes](../explanation/attributes.md) page.

&emsp; :bulb: [GitHub Discussions](https://github.com/Frameright/image-display-control-web-component/discussions)

## Table of Contents

<!-- toc -->

- [`data-image-regions=`](#data-image-regions)
- [`data-image-region-id=`](#data-image-region-id)
- [`data-avoid-no-region=`](#data-avoid-no-region)
- [`data-css-contain-fallback=`](#data-css-contain-fallback)
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
to `data-image-region-id="<no region>"`. This is roughly the same as setting
`data-disabled="all"`, although the CSS containment will still be applied.

See [CSS containment](../explanation/css-containment.md) for more information.

## `data-avoid-no-region=`

Type: string.

Supported values:

* `off`: The web component considers the full original image as a region valid
  region to select. If the component's ratio and the image's ratio are very
  close, the component will decide it's best not to zoom in on any region.
* `on` (default): The web component will always prefer to zoom in on a region
  if possible, rather than selecting the full original image.

> **NOTE**: `data-avoid-no-region="on"` is not a guarantee that the web
> component will always zoom in on a region. For example if there are no
> regions, or if `data-image-region-id="<no region>"` is set at the same time,
> the web component will still select the full original image.

## `data-css-contain-fallback=`

Type: string.

Supported values:

* `disable-component` (default): When the browser doesn't support
  `contain: paint;`, fall back to disabling the web component.
* `overflow-hidden`: Fall back to setting `overflow: hidden;` on the parent
  element instead. This works well if the component is the only child its parent
  element, otherwise it may remove scrollbars too aggressively.
* `disable-containment`: Fall back to not touching the parent element. This may
  cause rogue scrollbars.
* `force`: Even if the browser is known not to support `contain: paint;`, set
  it anyway.

See [Browser support](../explanation/browsers.md) and
[CSS containment](../explanation/css-containment.md) for more information.

## `data-disabled=`

Type: string.

Supported values:

* `none` (default): No functionality disabled. The web component will behave as
  expected.
* `all`: All functionality disabled. The web component will behave like a
  standard `<img>` tag.
* `css-contain`: Use of CSS `contain:` disabled. The web component will behave
  as if this feature wasn't supported by the browser and follow the fallback
  behavior set by the `data-css-contain-fallback=` attribute.

See [Browser support](../explanation/browsers.md) and
[CSS containment](../explanation/css-containment.md) for more information.

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
