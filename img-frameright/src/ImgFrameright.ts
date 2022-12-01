import { html, css, LitElement, CSSResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';

export class ImgFrameright extends LitElement {
  static styles: CSSResult = css`
    div.root {
      width: 100%;
      height: 100%;
      position: relative;
    }

    img {
      /* Prevents initial flickering. Will be set to 'visible' later when
         initial scaling has been calculated: */
      visibility: hidden;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._sizeObserverIntervalId ||= window.setInterval(() => {
      this._observeSize();
    }, ImgFrameright._SIZE_OBSERVER_PERIOD_MS);
  }

  disconnectedCallback() {
    if (this._sizeObserverIntervalId) {
      window.clearInterval(this._sizeObserverIntervalId);
      this._sizeObserverIntervalId = 0;
    }
    super.disconnectedCallback();
  }

  render() {
    // Note: instead of duplicating here again the full list of HTML attributes
    // we used to generate it in an earlier version of this code and render it
    // with:
    //
    //    return unsafeHTML(`<div class="root"><img ${htmlAttrs} /></div>`);
    //
    // However this led to Lit deleting and re-creating the elements, so the CSS
    // `transition: ` styles had no effect and everything was flickering.
    return html`
      <div class="root">
        <img
          alt=${this._alt ?? nothing}
          crossorigin=${this._crossorigin ?? nothing}
          decoding=${this._decoding ?? nothing}
          fetchpriority=${this._fetchpriority ?? nothing}
          height=${this._height ?? nothing}
          ?ismap=${this._ismap}
          loading=${this._loading ?? nothing}
          referrerpolicy=${this._referrerpolicy ?? nothing}
          sizes=${this._sizes ?? nothing}
          src=${this._src ?? nothing}
          srcset=${this._srcset ?? nothing}
          width=${this._width ?? nothing}
          usemap=${this._usemap ?? nothing}
          class=${this._class ?? nothing}
          contextmenu=${this._contextmenu ?? nothing}
          dir=${this._dir ?? nothing}
          enterkeyhint=${this._enterkeyhint ?? nothing}
          ?hidden=${this._hidden}
          inert=${this._inert ?? nothing}
          is=${this._is ?? nothing}
          itemid=${this._itemid ?? nothing}
          itemprop=${this._itemprop ?? nothing}
          itemref=${this._itemref ?? nothing}
          ?itemscope=${this._itemscope}
          itemtype=${this._itemtype ?? nothing}
          lang=${this._lang ?? nothing}
          nonce=${this._nonce ?? nothing}
          part=${this._part ?? nothing}
          role=${this._role ?? nothing}
          spellcheck=${this._spellcheck ?? nothing}
          style=${this._style ?? nothing}
          tabindex=${this._tabindex ?? nothing}
          title=${this._title ?? nothing}
          translate=${this._translate ?? nothing}
        />
      </div>
    `;
  }

  // Select this image region ID in order to force rendering the original image
  // instead of selecting the best region.
  private static readonly _IMAGE_REGION_ID_ORIGINAL = '__orig__';

  // Period in milliseconds for the component size observer.
  private static readonly _SIZE_OBSERVER_PERIOD_MS = 200;

  // Called periodically in order to observe the size of the component.
  // See https://stackoverflow.com/questions/8082729/how-to-detect-css3-resize-events
  private _observeSize() {
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
  private _sizeHasChanged() {
    const style = ['visibility: visible;'];

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
        `transform: scale(${scaleFactor.toFixed(3)});`,
        `transition: all ${(
          (ImgFrameright._SIZE_OBSERVER_PERIOD_MS * 1.5) /
          1000
        ).toFixed(3)}s`
      );
    }

    this._style = style.join(' ');
  }

  // All <img>-specific HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
  @property({ attribute: 'alt' }) _alt = null;
  @property({ attribute: 'crossorigin' }) _crossorigin = null;
  @property({ attribute: 'decoding' }) _decoding = null;
  @property({ attribute: 'fetchpriority' }) _fetchpriority = null;
  @property({ attribute: 'height' }) _height = null;
  @property({ attribute: 'ismap' }) _ismap = null;
  @property({ attribute: 'loading' }) _loading = null;
  @property({ attribute: 'referrerpolicy' }) _referrerpolicy = null;
  @property({ attribute: 'sizes' }) _sizes = null;
  @property({ attribute: 'src' }) _src = null;
  @property({ attribute: 'srcset' }) _srcset = null;
  @property({ attribute: 'width' }) _width = null;
  @property({ attribute: 'usemap' }) _usemap = null;

  // Relevant global HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  @property({ attribute: 'class' }) _class = null;
  @property({ attribute: 'contextmenu' }) _contextmenu = null;
  @property({ attribute: 'dir' }) _dir = null;
  @property({ attribute: 'enterkeyhint' }) _enterkeyhint = null;
  @property({ attribute: 'hidden' }) _hidden = null;
  @property({ attribute: 'inert' }) _inert = null;
  @property({ attribute: 'is' }) _is = null;
  @property({ attribute: 'itemid' }) _itemid = null;
  @property({ attribute: 'itemprop' }) _itemprop = null;
  @property({ attribute: 'itemref' }) _itemref = null;
  @property({ attribute: 'itemscope' }) _itemscope = null;
  @property({ attribute: 'itemtype' }) _itemtype = null;
  @property({ attribute: 'lang' }) _lang = null;
  @property({ attribute: 'nonce' }) _nonce = null;
  @property({ attribute: 'part' }) _part = null;
  @property({ attribute: 'role' }) _role = null;
  @property({ attribute: 'spellcheck' }) _spellcheck = null;
  @property({ attribute: 'style' }) _style: string | null = null;
  @property({ attribute: 'tabindex' }) _tabindex = null;
  @property({ attribute: 'title' }) _title = null;
  @property({ attribute: 'translate' }) _translate = null;

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
  // private _imageRegionId = ImgFrameright._IMAGE_REGION_ID_ORIGINAL;
  private _imageRegionId = 'threeanimals';

  // Interval observing the size of the component in order to react to size
  // changes.
  private _sizeObserverIntervalId = 0;

  // Last observed size of the component in pixel. Populated by _observeSize().
  private _currentWidth = 0;
  private _currentHeight = 0;
}
