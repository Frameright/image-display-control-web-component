import { html, css, LitElement, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// See https://stackoverflow.com/questions/34727936/typescript-bracket-notation-property-access
interface AccessAnyMemberByName {
  [key: string]: any;
}

export class ImgFrameright extends LitElement {
  static styles: CSSResult = css`
    div.root {
      width: 100%;
      height: 100%;
      position: relative;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._sizeObserverIntervalId ||= window.setInterval(() => {
      this._observeSize();
    }, 200);
  }

  disconnectedCallback() {
    if (this._sizeObserverIntervalId) {
      window.clearInterval(this._sizeObserverIntervalId);
      this._sizeObserverIntervalId = 0;
    }
    super.disconnectedCallback();
  }

  render() {
    let htmlAttrs = '';
    ImgFrameright._supportedHtmlAttrs.forEach((propName, attrName) => {
      const propValue = (this as AccessAnyMemberByName)[propName];
      if (propValue !== null) {
        htmlAttrs += ` ${attrName}="${propValue}"`;
      }
    });

    return unsafeHTML(`<div class="root"><img ${htmlAttrs.trim()} /></div>`);
  }

  // Full list of supported HTML attributes. Will be populated by the
  // @htmlAttrProp() decorators. Maps attribute names to property names.
  static _supportedHtmlAttrs: Map<string, string> = new Map();

  // Select this image region ID in order to force rendering the original image
  // instead of selecting the best region.
  private static readonly _IMAGE_REGION_ID_ORIGINAL = '__orig__';

  // Called periodically in order to observe the size of the component.
  // See https://stackoverflow.com/questions/8082729/how-to-detect-css3-resize-events
  _observeSize() {
    const hasChanged =
      this.offsetWidth !== this._currentWidth ||
      this.offsetHeight !== this._currentHeight;
    if (!hasChanged) {
      return;
    }
    this._currentWidth = this.offsetWidth;
    this._currentHeight = this.offsetHeight;
    this._sizeHasChanged();
  }

  // Called whenever the size of the component has changed. Applies dynamically
  // some CSS style to the <img> element. This couldn't be done in pure CSS,
  // https://stackoverflow.com/questions/50248577/css-transform-scale-based-on-container-width
  _sizeHasChanged() {
    const style = [];
    let region = null;
    if (ImgFrameright._IMAGE_REGION_ID_ORIGINAL !== this._imageRegionId) {
      region = this._imageRegions
        .filter(reg => this._imageRegionId === reg.id)
        .shift();
    }

    if (!region) {
      style.push('width: 100%;', 'height: 100%;', 'object-fit: cover;');
    } else {
      // avoid div by zero:
      const regionWidth = Math.max(region.width, 1);
      const regionHeight = Math.max(region.height, 1);
      const containerWidth = Math.max(this._currentWidth, 1);
      const containerHeight = Math.max(this._currentHeight, 1);

      let xOffset = 0;
      let yOffset = 0;
      let scaleFactor = 1;
      const containerRatio = containerWidth / containerHeight;
      if (containerRatio < region.ratio) {
        scaleFactor = containerWidth / regionWidth;
        yOffset = Math.round((containerHeight / scaleFactor - regionHeight) / 2);
      } else {
        scaleFactor = containerHeight / regionHeight;
        xOffset = Math.round((containerWidth / scaleFactor - regionWidth) / 2);
      }

      style.push(
        'position: absolute;',
        `left: ${-region.x + xOffset}px;`,
        `top: ${-region.y + yOffset}px;`,
        `transform-origin: ${region.x - xOffset}px ${region.y - yOffset}px;`,
        `transform: scale(${scaleFactor.toFixed(3)});`
      );
    }

    this._style = style.join(' ');
  }

  // All <img>-specific HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
  @htmlAttrProp('alt', '_alt') _alt = null;
  @htmlAttrProp('crossorigin', '_crossorigin') _crossorigin = null;
  @htmlAttrProp('decoding', '_decoding') _decoding = null;
  @htmlAttrProp('fetchpriority', '_fetchpriority') _fetchpriority = null;
  @htmlAttrProp('height', '_height') _height = null;
  @htmlAttrProp('ismap', '_ismap') _ismap = null;
  @htmlAttrProp('loading', '_loading') _loading = null;
  @htmlAttrProp('referrerpolicy', '_referrerpolicy') _referrerpolicy = null;
  @htmlAttrProp('sizes', '_sizes') _sizes = null;
  @htmlAttrProp('src', '_src') _src = null;
  @htmlAttrProp('srcset', '_srcset') _srcset = null;
  @htmlAttrProp('width', '_width') _width = null;
  @htmlAttrProp('usemap', '_usemap') _usemap = null;

  // Relevant global HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  @htmlAttrProp('accesskey', '_accesskey') _accesskey = null;
  @htmlAttrProp('autofocus', '_autofocus') _autofocus = null;
  @htmlAttrProp('class', '_class') _class = null;
  @htmlAttrProp('contextmenu', '_contextmenu') _contextmenu = null;
  @htmlAttrProp('dir', '_dir') _dir = null;
  @htmlAttrProp('enterkeyhint', '_enterkeyhint') _enterkeyhint = null;
  @htmlAttrProp('hidden', '_hidden') _hidden = null;
  @htmlAttrProp('inert', '_inert') _inert = null;
  @htmlAttrProp('is', '_is') _is = null;
  @htmlAttrProp('itemid', '_itemid') _itemid = null;
  @htmlAttrProp('itemprop', '_itemprop') _itemprop = null;
  @htmlAttrProp('itemref', '_itemref') _itemref = null;
  @htmlAttrProp('itemscope', '_itemscope') _itemscope = null;
  @htmlAttrProp('itemtype', '_itemtype') _itemtype = null;
  @htmlAttrProp('lang', '_lang') _lang = null;
  @htmlAttrProp('nonce', '_nonce') _nonce = null;
  @htmlAttrProp('part', '_part') _part = null;
  @htmlAttrProp('role', '_role') _role = null;
  @htmlAttrProp('spellcheck', '_spellcheck') _spellcheck = null;
  @htmlAttrProp('style', '_style') _style: string | null = null;
  @htmlAttrProp('tabindex', '_tabindex') _tabindex = null;
  @htmlAttrProp('title', '_title') _title = null;
  @htmlAttrProp('translate', '_translate') _translate = null;

  // FIXME: should come from an HTML attribute
  private _imageRegions = [
    {
      id: 'threeanimals',
      x: 245, // px
      y: 1087, // px
      width: 664 - 245, // px
      height: 1269 - 1087, // px
      ratio: (664 - 245) / (1269 - 1087),
    },
  ];

  // FIXME: should come from an HTML attribute
  private _imageRegionId = ImgFrameright._IMAGE_REGION_ID_ORIGINAL;

  // Interval observing the size of the component in order to react to size
  // changes.
  private _sizeObserverIntervalId = 0;

  // Last observed size of the component in pixel. Populated by _observeSize().
  private _currentWidth = 0;
  private _currentHeight = 0;
}

function htmlAttrProp(htmlAttrName: string, propName: string) {
  // Populate the full supported HTML attributes...
  ImgFrameright._supportedHtmlAttrs.set(htmlAttrName, propName);

  // ... then call the standard Lit @property decorator:
  return property({ attribute: htmlAttrName });
}
