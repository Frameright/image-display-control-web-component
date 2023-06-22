# CSS containment

[CSS containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment)
is a set of browser features allowing web developers to indicate that an element
and its contents are, as much as possible, independent of the rest of the
document.

For example, when setting `contain: paint;` on an element, the browser then
knows for a fact that the element and its children don't intend to draw anything
outside of the element's
[box](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model).
This allows the browser to skip a lot of calculations, which can result in a
significant performance boost.

The web component uses the `transform*` CSS properties in order to zoom in on a
region. Although it also uses the `clip-path` CSS property in order to clip what
is outside its box, the browser doesn't know by default that the web component
doesn't intend to draw at all outside its box and reserves space for it. This
causes an overflow and thus unwanted scrollbars.

To prevent this, the web component sets `contain: paint;` on its parent element
by default. This may not be supported on older browsers and you can tweak this
behavior. See [Browser support](browsers.md) and
[Attribute reference](../reference/attributes.md) for more details.
