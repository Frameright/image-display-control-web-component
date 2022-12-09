import { html, css, LitElement, CSSResult, nothing, PropertyValues } from 'lit';
// eslint-disable-next-line no-unused-vars
import { property } from 'lit/decorators.js';
import {
  ImageRegionFromHtmlAttr,
  RectangleImageRegion,
} from './RectangleImageRegion.js';
import { SizeInPixels } from './SizeInPixels.js';

export class ImgFrameright extends LitElement {
  // Period in milliseconds for the component observer.
  private static readonly _OBSERVER_PERIOD_MS = 200;

  static styles: CSSResult = css`
    :host {
      /**
       * In order to behave like a replaced element (e.g. an <img>), see
       *   * https://developer.mozilla.org/en-US/docs/Web/CSS/display
       *   * https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element
       */
      display: inline-block;

      /**
       * In the case of a DOM looking like
       *
       *   <div> <!-- parent container -->
       *     <img-frameright src="my-very-large-image.jpg"> <!-- web component -->
       *       <img src="my-very-large-image.jpg"> <!-- image -->
       *     </img-frameright>
       *   </div>
       *
       * we want the web component to not overflow the parent container, but
       * instead the image to initially overflow the web component.
       */
      max-width: 100%;
      max-height: 100%;

      overflow: hidden;
    }

    img {
      /* Prevents initial flickering. Will be set to 'visible' later when
         initial scaling has been calculated: */
      visibility: hidden;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._observerIntervalId ||= window.setInterval(() => {
      this._observe();
    }, ImgFrameright._OBSERVER_PERIOD_MS);
  }

  disconnectedCallback() {
    if (this._observerIntervalId) {
      window.clearInterval(this._observerIntervalId);
      this._observerIntervalId = 0;
    }
    super.disconnectedCallback();
  }

  // Called whenever some properties (incl. HTML attributes) of the component
  // change.
  willUpdate(changedProperties: PropertyValues<this>) {
    const imageRegionsHaveChanged = changedProperties.has('_imageRegions');
    const imageRegionIdHasChanged = changedProperties.has('_imageRegionId');

    if (imageRegionsHaveChanged) {
      this._populateRectangleImageRegions();
    }
    if (imageRegionsHaveChanged || imageRegionIdHasChanged) {
      this._panAndZoomToBestFittingRegion();
    }
  }

  render() {
    // Notes:
    // * On purpose we don't forward the `width=` and `height=` attributes down
    //   to the `<img>` element as this then messes with our calculated CSS
    //   scaling and moving. Instead we apply them to the root/host element's
    //   style inside willUpdate().
    // * On purpose we don't forward the `style=` attribute down to the `<img>`
    //   element as it's probably best applied to the root/host element only.
    //   (Thus we use `this._imgStyle` instead of `this._style` here.)
    return html`
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
        style=${this._imgStyle ?? nothing}
        tabindex=${this._tabindex ?? nothing}
        title=${this._title ?? nothing}
        translate=${this._translate ?? nothing}
      />
    `;
  }

  // Populates this._rectangleImageRegions based on this._imageRegions, passed
  // as HTML attribute. Doesn't trigger a re-rendering.
  private _populateRectangleImageRegions() {
    this._log('Populating rectangle image regions...');
    if (this._originalImageRegion.size.isUnknown()) {
      this._log('Natural image size unknown, deferring.');
      return;
    }

    this._rectangleImageRegions = [];
    this._imageRegions.forEach(region => {
      const rectangleImageRegion = new RectangleImageRegion();
      rectangleImageRegion.setFields(region, this._originalImageRegion.size);
      if (rectangleImageRegion.isUnknown()) {
        return;
      }

      if (region.absolute && this._srcset) {
        this._error('Do not use absolute regions together with srcset=');
      }

      this._log(
        `Rectangle region found: id=${rectangleImageRegion.id}, ` +
          `position=${rectangleImageRegion.position}, ` +
          `size=${rectangleImageRegion.size}`
      );
      this._rectangleImageRegions.push(rectangleImageRegion);
    });
  }

  // Called periodically in order to observe the size of the component and the
  // initial size of the image.
  //
  // The initial size of the image is the space it takes up initially in the
  // document without any CSS applied. It is defined as follows:
  // * If the `<img width="..." height="..." />` attributes are used, then it is
  //   them (and the image may be distorted if they don't respect the image's
  //   natural ratio, otherwise
  // * If only `<img width="..." />` or `<img height="..." />` is used, then it
  //   is that, and the missing value is calculated from the image's natural
  //   ratio, otherwise
  // * It is the natural size of the image.
  //
  // The natural size of the image is defined as follows:
  // * If no `<img srcset="..." sizes="..." />` is used, then it is the size of
  //   the image pointed at by `src=`, otherwise
  // * If `<img srcset="..." sizes="..." />` is used, then it is the width
  //   expressed by `sizes=` and the height is calculated based on one of the
  //   image's ratios, hoping they all have the same ratio although they have
  //   different sizes. For example if `sizes="(max-width: 1000px) 100vw,
  //   1000px"`, then the natural width is the current viewport width capped at
  //   1000px.
  //
  // See:
  // * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth
  // * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalHeight
  // * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/width
  // * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/height
  //
  // The initial size of the image is the base size to take into account when
  // calculating the scaling factor, so it is important to monitor it as it can
  // change when the viewport size changes.
  private _observe() {
    let initialSizeHasChanged = false;
    let componentSizeHasChanged = false;

    const imgElement = this.renderRoot.querySelector('img');
    if (imgElement) {
      const currentInitialSize = new SizeInPixels(
        imgElement.width,
        imgElement.height
      );
      initialSizeHasChanged =
        this._originalImageRegion.size.setIfDifferent(currentInitialSize);
    }

    const currentComponentSize = new SizeInPixels(
      this.offsetWidth,
      this.offsetHeight
    );
    componentSizeHasChanged =
      this._currentComponentSize.setIfDifferent(currentComponentSize);

    if (initialSizeHasChanged) {
      this._log(`Initial image size: ${this._originalImageRegion.size}`);
      this._populateRectangleImageRegions();
    }
    if (componentSizeHasChanged) {
      this._log(`Component size: ${this._currentComponentSize}`);
    }
    if (initialSizeHasChanged || componentSizeHasChanged) {
      this._panAndZoomToBestFittingRegion();
    }
  }

  // Applies dynamically some CSS style to the <img> element. This couldn't be
  // done in pure CSS, see
  // https://stackoverflow.com/questions/50248577/css-transform-scale-based-on-container-width
  //
  // Note: it will automatically triggers a re-rending as it touches the <img>
  // element's `style=` HTML attribute.
  private _panAndZoomToBestFittingRegion() {
    this._log('Panning and zooming to best fitting region...');
    if (this._originalImageRegion.size.isUnknown()) {
      this._log('Natural image size unknown, deferring.');
      return;
    }

    const style = ['visibility: visible;'];

    // Avoid initial flickering by not having a transition when styling for the
    // first time:
    const firstTime = !this._imgStyle;
    if (!firstTime) {
      style.push(
        'transition: all',
        `${parseFloat(
          ((ImgFrameright._OBSERVER_PERIOD_MS * 1.5) / 1000).toFixed(3)
        )}s;`
      );
    }

    let bestRegion = null;
    if (this._imageRegionId) {
      // The user has manually selected an image region by ID via HTML
      // attribute, let's look for it:
      bestRegion = this._rectangleImageRegions.find(
        region => region.id === this._imageRegionId
      );
    }
    if (!bestRegion) {
      bestRegion = this._findBestFittingRegion();
    }

    const cssScaling = bestRegion.getCssScaling(
      this._currentComponentSize,
      this._originalImageRegion.size
    );
    style.push(
      `transform-origin: ${cssScaling.origin.getX()}px ${cssScaling.origin.getY()}px;`,
      `transform: translate(${-cssScaling.origin.getX()}px,`,
      `${-cssScaling.origin.getY()}px)`,
      `scale(${cssScaling.factor.toFixed(3)});`
    );

    this._imgStyle = style.join(' ');
  }

  // Returns the image region that's the closest to the current component size.
  private _findBestFittingRegion(): RectangleImageRegion {
    // Determining the best fitting image region for the current component size.
    let bestRegion = this._originalImageRegion;
    if (!bestRegion.size.isUnknown()) {
      let smallestRatioDiff = this._currentComponentSize.ratioDiffFactor(
        this._originalImageRegion.size
      );

      // It's only worth looking for an image region if the component ratio and
      // the original image ratio differ enough:
      if (smallestRatioDiff > 1.1) {
        this._rectangleImageRegions.forEach(region => {
          const ratioDiff = this._currentComponentSize.ratioDiffFactor(
            region.size
          );
          if (ratioDiff < smallestRatioDiff) {
            smallestRatioDiff = ratioDiff;
            bestRegion = region;
          }
        });
      }
    }

    this._log(`Selected region: ${bestRegion.id}`);
    return bestRegion;
  }

  // Returns the editable style object of the root/host element.
  private _getRootElementStyleObject() {
    let styleObject;
    if ('style' in this.renderRoot) {
      // HTMLElement
      styleObject = this.renderRoot.style;
    } else {
      // ShadowRoot
      styleObject = (this.renderRoot.host as HTMLElement).style;
    }
    return styleObject;
  }

  private _log(text: string) {
    if (this._debug) {
      // eslint-disable-next-line no-console
      console.log(this._id ? `[${this._id}] ${text}` : text);
    }
  }

  private _error(text: string) {
    if (this._debug) {
      // eslint-disable-next-line no-console
      console.error(this._id ? `[${this._id}] ${text}` : text);
    }
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
  @property({ attribute: 'id' }) _id = null;
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
  @property({ attribute: 'style' }) _style = null;
  @property({ attribute: 'tabindex' }) _tabindex = null;
  @property({ attribute: 'title' }) _title = null;
  @property({ attribute: 'translate' }) _translate = null;

  // ImgFrameright-specific attributes:
  @property({ attribute: 'image-regions', type: Array })
  _imageRegions: ImageRegionFromHtmlAttr[] = [];
  @property({ attribute: 'image-region-id' }) _imageRegionId: string = '';
  @property({ attribute: 'debug', type: Boolean }) _debug: boolean = false;

  // Dynamically generated `<img style=` attribute whose main purpose is to pan
  // and zoom to a specific image region:
  @property() _imgStyle: string | null = null;

  // Special region representing the entire original image. Gets populated and
  // updated by _observe().
  private _originalImageRegion = new RectangleImageRegion('<no region>');

  // Sanitized version of this._imageRegions (passed as HTML attribute).
  // Populated by _populateRectangleImageRegions().
  private _rectangleImageRegions: RectangleImageRegion[] = [];

  // Interval observing the component in order to react to changes in size.
  private _observerIntervalId = 0;

  // Last observed size of the component in pixels. Populated by _observe().
  private _currentComponentSize = new SizeInPixels();
}
