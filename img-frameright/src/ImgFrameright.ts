import { html, css, LitElement, CSSResult, PropertyValues } from 'lit';
// eslint-disable-next-line no-unused-vars
import { property } from 'lit/decorators.js';
import { Logger } from './Logger.js';
import { PositionInRelativeCoord } from './PositionInRelativeCoord.js';
import {
  ImageRegionFromHtmlAttr,
  RectangleImageRegion,
} from './RectangleImageRegion.js';
import { SizeInPixels } from './SizeInPixels.js';
import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';

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
       *     <img-frameright> <!-- web component -->
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
    if (changedProperties.has('_loglevel')) {
      this._logger.setLevel(this._loglevel);
    }
    if (changedProperties.has('_id')) {
      this._logger.setId(this._id);
    }

    const imageRegionsHaveChanged = changedProperties.has('_imageRegions');
    const imageRegionIdHasChanged = changedProperties.has('_imageRegionId');

    if (imageRegionsHaveChanged) {
      this._populateRectangleImageRegions();
    }
    if (imageRegionsHaveChanged || imageRegionIdHasChanged) {
      const firstChildElement = this.firstElementChild as HTMLElement;
      if (firstChildElement) {
        this._panAndZoomToBestFittingRegion(firstChildElement.style);
      }
    }
  }

  render() {
    // Simply render any elements passed to the component. Hopefully only one
    // element will be passed, and it will be an <img> element.
    return html`<slot></slot>`;
  }

  // Populates this._rectangleImageRegions based on this._imageRegions, passed
  // as HTML attribute. Doesn't trigger a re-rendering.
  private _populateRectangleImageRegions() {
    this._logger.debug('Populating rectangle image regions...');

    this._rectangleImageRegions = [];
    this._imageRegions.forEach(region => {
      const rectangleImageRegion = new RectangleImageRegion();
      rectangleImageRegion.setFields(region, this._logger);
      if (rectangleImageRegion.isUnknown()) {
        return;
      }

      this._logger.debug(
        `Rectangle region found: id=${rectangleImageRegion.id}, ` +
          `position=${rectangleImageRegion.position}, ` +
          `size=${rectangleImageRegion.size}`
      );
      this._rectangleImageRegions.push(rectangleImageRegion);
    });
  }

  // Called periodically in order to observe the size of the component and the
  // initial size of the image.
  private _observe() {
    let childElementCountHasChanged = false;
    let initialSizeHasChanged = false;
    let componentSizeHasChanged = false;

    const oldChildElementCount = this._currentChildElementCount;
    this._currentChildElementCount = this.children.length;
    childElementCountHasChanged =
      oldChildElementCount !== this._currentChildElementCount;

    if (childElementCountHasChanged) {
      // Trace only when the number of children changes in order not to spam
      // the console.

      if (this._currentChildElementCount < 1) {
        this._logger.error('<img-frameright> has no child element.');
      }
      if (this._currentChildElementCount > 1) {
        this._logger.warn(
          '<img-frameright> has more than one child element. ' +
            'Only the first one will be used.'
        );
      }
    }

    const firstChildElement = this.firstElementChild as HTMLElement;
    if (!firstChildElement) {
      return;
    }

    if (childElementCountHasChanged) {
      // Trace only when the number of children changes in order not to spam
      // the console.
      if (firstChildElement.tagName.toLowerCase() !== 'img') {
        this._logger.warn(
          "<img-frameright>'s first child isn't an <img> element. " +
            'This may cause unexpected behavior.'
        );
      }
    }

    // Replaced elements like <img> and <video> have `width` and `height`
    // attributes but other elements don't:
    const currentInitialSize = new SizeInPixels(
      (firstChildElement as HTMLImageElement).width ??
        firstChildElement.offsetWidth,
      (firstChildElement as HTMLImageElement).height ??
        firstChildElement.offsetHeight
    );
    initialSizeHasChanged =
      this._currentInitialImageSize.setIfDifferent(currentInitialSize);

    const currentComponentSize = new SizeInPixels(
      this.offsetWidth,
      this.offsetHeight
    );
    componentSizeHasChanged =
      this._currentComponentSize.setIfDifferent(currentComponentSize);

    if (initialSizeHasChanged) {
      this._logger.debug(
        `Initial image size: ${this._currentInitialImageSize}`
      );
    }
    if (componentSizeHasChanged) {
      this._logger.debug(`Component size: ${this._currentComponentSize}`);
    }
    if (
      initialSizeHasChanged ||
      componentSizeHasChanged ||
      childElementCountHasChanged
    ) {
      this._panAndZoomToBestFittingRegion(firstChildElement.style);
    }
  }

  // Applies dynamically some CSS style to the image element. This couldn't be
  // done in pure CSS, see
  // https://stackoverflow.com/questions/50248577/css-transform-scale-based-on-container-width
  //
  // Note: it will automatically trigger a re-rending as it touches the image
  // element's `style=` HTML attribute.
  private _panAndZoomToBestFittingRegion(
    imageStyleToBeSet: CSSStyleDeclaration
  ) {
    this._logger.debug('Panning and zooming to best fitting region...');
    if (this._currentInitialImageSize.isUnknown()) {
      this._logger.debug('Initial image size unknown, deferring.');
      return;
    }

    // eslint-disable-next-line no-param-reassign
    imageStyleToBeSet.transition = `all ${parseFloat(
      ((ImgFrameright._OBSERVER_PERIOD_MS * 1.5) / 1000).toFixed(3)
    )}s`;

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
      this._currentInitialImageSize
    );
    // eslint-disable-next-line no-param-reassign
    imageStyleToBeSet.transformOrigin = `${cssScaling.origin.x.toFixed(
      3
    )}px ${cssScaling.origin.y.toFixed(3)}px`;
    // eslint-disable-next-line no-param-reassign
    imageStyleToBeSet.transform = `translate(${-cssScaling.origin.x.toFixed(
      3
    )}px, ${-cssScaling.origin.y.toFixed(
      3
    )}px) scale(${cssScaling.factor.toFixed(3)})`;
  }

  // Returns the image region that's the closest to the current component size.
  private _findBestFittingRegion(): RectangleImageRegion {
    // Determining the best fitting image region for the current component size.
    let bestRegion = this._originalImageRegion;
    let smallestRatioDiff = this._currentComponentSize.ratioDiffFactor(
      this._currentInitialImageSize
    );

    // It's only worth looking for an image region if the component ratio and
    // the original image ratio differ enough:
    if (smallestRatioDiff > 1.1) {
      this._rectangleImageRegions.forEach(region => {
        const ratioDiff = this._currentComponentSize.ratioDiffFactor(
          region.size.getSizeInPixels(this._currentInitialImageSize)
        );
        if (ratioDiff < smallestRatioDiff) {
          smallestRatioDiff = ratioDiff;
          bestRegion = region;
        }
      });
    }

    this._logger.debug(`Selected region: ${bestRegion.id}`);
    return bestRegion;
  }

  // `image-regions=` HTML attribute accepting a JSON array of image regions.
  @property({ attribute: 'image-regions', type: Array })
  _imageRegions: ImageRegionFromHtmlAttr[] = [];

  // `image-region-id=` HTML attribute for forcing zooming on a specific image
  // region.
  @property({ attribute: 'image-region-id' }) _imageRegionId: string = '';

  // `loglevel=` HTML attribute for setting the log level (e.g. to 'debug',
  // 'warn' or 'error').
  @property({ attribute: 'loglevel' }) _loglevel: string = '';

  // Standard `id=` HTML attribute. See
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  @property({ attribute: 'id' }) _id: string | null = null;

  // Special region representing the entire original image. Gets populated and
  // updated by _observe().
  private _originalImageRegion = new RectangleImageRegion(
    '<no region>',
    new PositionInRelativeCoord(0, 0),
    new SizeInRelativeCoord(1, 1)
  );

  // Sanitized version of this._imageRegions (passed as HTML attribute).
  // Populated by _populateRectangleImageRegions().
  private _rectangleImageRegions: RectangleImageRegion[] = [];

  // Interval observing the component in order to react to changes in size.
  private _observerIntervalId = 0;

  // Last observed size of the component in pixels. Populated by _observe().
  private _currentComponentSize = new SizeInPixels();

  // Last observed number of child elements (rendered with `<slot>`). Populated
  // by _observe().
  private _currentChildElementCount = -1;

  // Last observed initial size of the image in pixels. Populated by _observe().
  //
  // The initial size of the image is the space it would take up initially in
  // the document without any CSS applied. It is defined as follows:
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
  private _currentInitialImageSize = new SizeInPixels();

  private _logger: Logger = new Logger(this._id, this._loglevel);
}
