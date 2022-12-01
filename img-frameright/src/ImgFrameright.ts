import { html, css, LitElement, CSSResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';

interface ImageRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ratio: number;
}

export class ImgFrameright extends LitElement {
  // Image region ID of the entire original image.
  private static readonly _IMAGE_REGION_ID_ORIGINAL = '__orig__';

  // Period in milliseconds for the component size observer.
  private static readonly _SIZE_OBSERVER_PERIOD_MS = 200;

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

      transition: all
        ${parseFloat(
          ((ImgFrameright._SIZE_OBSERVER_PERIOD_MS * 1.5) / 1000).toFixed(3)
        )}s;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._populateImageRegions();
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
    // Notes:
    //
    // * Instead of duplicating here again the full list of HTML attributes
    //   we used to generate it in an earlier version of this code and render it
    //   with:
    //
    //      return unsafeHTML(`<div class="root"><img ${htmlAttrs} /></div>`);
    //
    //   However this led to Lit deleting and re-creating the elements, so the
    //   CSS `transition: ` styles had no effect and everything was flickering.
    //
    // * On purpose we don't forward the `width=` and `height=` attributes down
    //   to the `<img>` element as this then messes with our calculated CSS
    //   scaling and moving.
    return html`
      <div class="root">
        <img
          alt=${this._alt ?? nothing}
          crossorigin=${this._crossorigin ?? nothing}
          decoding=${this._decoding ?? nothing}
          fetchpriority=${this._fetchpriority ?? nothing}
          ?ismap=${this._ismap}
          loading=${this._loading ?? nothing}
          referrerpolicy=${this._referrerpolicy ?? nothing}
          sizes=${this._sizes ?? nothing}
          src=${this._src ?? nothing}
          srcset=${this._srcset ?? nothing}
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

  // Calculates the difference between two image ratios, expressed as the
  // factor >= 1, so that one ratio multiplied by this factor gives the other
  // ratio.
  private static _imageRatioDiffFactor(
    firstRatio: number,
    secondRatio: number
  ) {
    // Avoid dividing by 0:
    const first = Math.max(firstRatio, 0.01);
    const second = Math.max(secondRatio, 0.01);

    return first >= second ? first / second : second / first;
  }

  // Hydrates this._imageRegions
  private _populateImageRegions() {
    const originalRegion = this._imageRegions[0];

    function populateOriginalImageRatio() {
      // Avoid dividing by 0:
      originalRegion.width = Math.max(originalRegion.width, 1);
      originalRegion.height = Math.max(originalRegion.height, 1);

      originalRegion.ratio = originalRegion.width / originalRegion.height;
    }

    // If the width and height has been passed as HTML attributes, use them:
    if (this._width) {
      originalRegion.width = parseInt(this._width, 10);
    }
    if (this._height) {
      originalRegion.height = parseInt(this._height, 10);
    }
    if (originalRegion.width >= 0 && originalRegion.height >= 0) {
      populateOriginalImageRatio();
    } else if (this._src) {
      // Else get that information asynchronously by loading the image file:
      const img = new Image();
      img.onload = () => {
        originalRegion.width = img.width;
        originalRegion.height = img.height;
        populateOriginalImageRatio();
      };
      img.src = this._src;
    }
  }

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

    // Determining the best fitting image region for the current container size.
    let bestRegion = this._imageRegions[0]; // entire original image
    const originalImageRatio = bestRegion.ratio;

    // Avoid dividing by 0:
    const containerWidth = Math.max(this._currentWidth, 1);
    const containerHeight = Math.max(this._currentHeight, 1);
    const containerRatio = containerWidth / containerHeight;

    if (bestRegion.ratio > 0) {
      // nothing we can do if this hasn't been set
      let smallestRatioDiff = ImgFrameright._imageRatioDiffFactor(
        containerRatio,
        originalImageRatio
      );

      // It's only worth looking for an image region if the container ratio and
      // the original image ratio differ enough:
      if (smallestRatioDiff > 1.1) {
        this._imageRegions.slice(1).forEach(region => {
          const ratioDiff = ImgFrameright._imageRatioDiffFactor(
            containerRatio,
            region.ratio
          );
          if (ratioDiff < smallestRatioDiff) {
            smallestRatioDiff = ratioDiff;
            bestRegion = region;
          }
        });
      }
    }

    if (ImgFrameright._IMAGE_REGION_ID_ORIGINAL === bestRegion.id) {
      style.push('width: 100%;', 'height: 100%;', 'object-fit: cover;');
    } else {
      // Avoid dividing by 0:
      const regionWidth = Math.max(bestRegion.width, 1);
      const regionHeight = Math.max(bestRegion.height, 1);

      let xOffset = 0;
      let yOffset = 0;
      let scaleFactor = 1;
      if (containerRatio < bestRegion.ratio) {
        scaleFactor = containerWidth / regionWidth;
        yOffset = Math.round(
          (containerHeight / scaleFactor - regionHeight) / 2
        );
      } else {
        scaleFactor = containerHeight / regionHeight;
        xOffset = Math.round((containerWidth / scaleFactor - regionWidth) / 2);
      }

      style.push(
        'position: absolute;',
        `left: ${-bestRegion.x + xOffset}px;`,
        `top: ${-bestRegion.y + yOffset}px;`,
        `transform-origin: ${bestRegion.x - xOffset}px ${
          bestRegion.y - yOffset
        }px;`,
        `transform: scale(${scaleFactor.toFixed(3)});`
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
  @property({ attribute: 'src' }) _src: string | null = null;
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

  private _imageRegions: ImageRegion[] = [
    {
      id: ImgFrameright._IMAGE_REGION_ID_ORIGINAL,
      x: 0, // px
      y: 0, // px

      // these fields will be populated by _populateImageRegions():
      width: -1,
      height: -1,
      ratio: -1,
    },
    // FIXME: should come from an HTML attribute:
    {
      id: 'oneanimal',
      x: 217, // px
      y: 1062, // px
      width: 456 - 217, // px
      height: 1282 - 1062, // px
      ratio: (456 - 217) / (1282 - 1062), // FIXME should be generated
    },
    {
      id: 'threeanimals',
      x: 245, // px
      y: 1087, // px
      width: 664 - 245, // px
      height: 1269 - 1087, // px
      ratio: (664 - 245) / (1269 - 1087), // FIXME should be generated
    },
  ];

  // Interval observing the size of the component in order to react to size
  // changes.
  private _sizeObserverIntervalId = 0;

  // Last observed size of the component in pixel. Populated by _observeSize().
  private _currentWidth = 0;
  private _currentHeight = 0;
}
