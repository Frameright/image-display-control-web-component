import { Logger } from './Logger.js';
import { PositionInRelativeCoord } from './PositionInRelativeCoord.js';
import {
  ImageRegionFromHtmlAttr,
  RectangleImageRegion,
} from './RectangleImageRegion.js';
import { SizeInPixels } from './SizeInPixels.js';
import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';

export class ImageDisplayControl extends HTMLImageElement {
  // Period in milliseconds for the element observer.
  private static readonly _SIZE_OBSERVER_PERIOD_MS = 200;

  // Special region representing the entire original image.
  private static readonly _ORIGINAL_IMAGE_REGION = new RectangleImageRegion(
    '<no region>',
    new PositionInRelativeCoord(0, 0),
    new SizeInRelativeCoord(1, 1)
  );

  constructor() {
    super();

    // Link the original image size to the element size.
    this.style.objectFit = 'contain';
    this.style.objectPosition = 'top left';

    // Remove borders and padding as:
    // 1. They don't survive zooming and clipping,
    // 2. They wrong our CSS `transform:` calculations.
    this.style.border = 'none';
    this.style.padding = '0';

    // Zooming the image with CSS `transform: scale()` creates an overflowing
    // content, even though we clip it with a `clip-path:`. If none of the
    // ancestors has an `overflow: hidden;` property, one of the ancestors,
    // usually `<body>` will end up having to display scrollbars for this
    // clipped image part, which we don't want. This can be prevented with CSS
    // containment by setting the parent's `contain:` property to `paint`,
    // `layout` or `content`. See:
    // * https://developer.mozilla.org/en-US/docs/Web/CSS/contain
    // * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment
    if (this.parentElement) {
      if (
        this.parentElement.style.contain !== 'paint' &&
        this.parentElement.style.contain !== 'layout' &&
        this.parentElement.style.contain !== 'content'
      ) {
        this.parentElement.style.contain = 'paint';
      }
    }

    this._attributeObserver.observe(this, {
      attributeFilter: [
        'id',
        'data-loglevel',
        'data-image-regions', // JSON array of image regions
        'data-image-region-id', // forces zooming on a specific image region
      ],
    });

    window.setInterval(() => {
      this._observeElementSize();
    }, ImageDisplayControl._SIZE_OBSERVER_PERIOD_MS);

    this._populateRectangleImageRegions();
  }

  // Called whenever an HTML attribute of the element has changed.
  _attributeHasChanged(mutationList: MutationRecord[]) {
    mutationList.forEach(mutation => {
      if (mutation.type !== 'attributes') {
        this._logger.warn(`Unexpected mutation type: ${mutation.type}`);
        return;
      }

      switch (mutation.attributeName) {
        case 'id':
          this._logger.setId(this.id);
          break;

        case 'data-loglevel':
          this._logger.setLevel(this.dataset.loglevel);
          break;

        case 'data-image-regions':
          this._populateRectangleImageRegions();
          this._panAndZoomToBestFittingRegion();
          break;

        case 'data-image-region-id':
          this._panAndZoomToBestFittingRegion();
          break;

        default:
          this._logger.warn(
            `Unexpected attribute mutation: ${mutation.attributeName}`
          );
          break;
      }
    });
  }

  // Populates this._rectangleImageRegions based on the 'data-image-regions'
  // HTML attribute.
  private _populateRectangleImageRegions() {
    this._logger.debug('Populating rectangle image regions...');

    this._rectangleImageRegions = [];
    let imageRegions: ImageRegionFromHtmlAttr[] = [];
    let isInvalid = false;
    try {
      imageRegions = JSON.parse(this.dataset.imageRegions || '[]');
    } catch (SyntaxError) {
      isInvalid = true;
    }
    isInvalid ||= !Array.isArray(imageRegions);
    if (isInvalid) {
      this._logger.warn("Invalid 'data-image-regions' attribute");
      imageRegions = [];
    }

    imageRegions.forEach(region => {
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

    if (!this._rectangleImageRegions.length) {
      this._logger.debug('No rectangle image region found');
    }
  }

  // Called periodically in order to observe the size of the element.
  private _observeElementSize() {
    const currentElementSize = new SizeInPixels(
      this.offsetWidth,
      this.offsetHeight
    );
    const elementSizeHasChanged =
      this._elementSize.setIfDifferent(currentElementSize);

    if (elementSizeHasChanged) {
      this._logger.debug(`Element size: ${this._elementSize}`);
      this._populateFittedImageSize();
      this._panAndZoomToBestFittingRegion();
    }
  }

  // Populates this._fittedImageSize and this._fittedImageBottomRightMargin
  // based on this._elementSize.
  private _populateFittedImageSize() {
    const naturalImageSize = new SizeInPixels(
      this.naturalWidth,
      this.naturalHeight
    );

    let fittingFactor = 1;
    if (this._elementSize.getSafeRatio() < naturalImageSize.getSafeRatio()) {
      // Here the original image has a higher width/height ratio than the
      // element, i.e. the image is "flatter". So we know that
      // `object-fit: contain; object-position: top left;` will have fitted the
      // image to the element in order to make things look like:
      //
      //   +-----------------------+
      //   | element with image    |
      //   +- - - - - - - - - - - -+
      //   | element without image |
      //   +-----------------------+
      fittingFactor =
        this._elementSize.getSafeWidth() / naturalImageSize.getSafeWidth();
    } else {
      // Same calculations as in the other code branch, but simply having
      // swapped the X and Y axes.
      fittingFactor =
        this._elementSize.getSafeHeight() / naturalImageSize.getSafeHeight();
    }

    this._fittedImageSize = new SizeInPixels(
      this.naturalWidth * fittingFactor,
      this.naturalHeight * fittingFactor
    );

    this._fittedImageBottomRightMargin = new SizeInPixels(
      this._elementSize.getWidth() - this._fittedImageSize.getWidth(),
      this._elementSize.getHeight() - this._fittedImageSize.getHeight()
    );

    this._logger.debug(`Fitted image size: ${this._fittedImageSize}`);
    this._logger.debug(
      `Fitted image margin: ${this._fittedImageBottomRightMargin}`
    );
  }

  // Applies dynamically some CSS style to the image element. This couldn't be
  // done in pure CSS, see
  // https://stackoverflow.com/questions/50248577/css-transform-scale-based-on-container-width
  private _panAndZoomToBestFittingRegion() {
    this._logger.debug('Panning and zooming to best fitting region...');
    if (this._fittedImageSize.isUnknown()) {
      this._logger.debug('Fitted image size unknown, deferring.');
      return;
    }

    let bestRegion = null;
    if (this.dataset.imageRegionId) {
      // The user has manually selected an image region by ID via HTML
      // attribute, let's look for it:
      bestRegion = this._rectangleImageRegions.find(
        region => region.id === this.dataset.imageRegionId
      );
    }
    if (!bestRegion) {
      bestRegion = this._findBestFittingRegion();
    }

    const cssScaling = bestRegion.getCssTransformation(
      this._elementSize,
      this._fittedImageSize,
      this._fittedImageBottomRightMargin
    );
    this.style.transformOrigin = `${cssScaling.origin.x.toFixed(
      3
    )}px ${cssScaling.origin.y.toFixed(3)}px`;
    this.style.transform = `translate(${-cssScaling.origin.x.toFixed(
      3
    )}px, ${-cssScaling.origin.y.toFixed(
      3
    )}px) scale(${cssScaling.factor.toFixed(3)})`;
    this.style.clipPath =
      `inset(${cssScaling.insetClipFromTopLeft.getHeight()}px ` +
      `${cssScaling.insetClipFromBottomRight.getWidth()}px ` +
      `${cssScaling.insetClipFromBottomRight.getHeight()}px ` +
      `${cssScaling.insetClipFromTopLeft.getWidth()}px)`;
  }

  // Returns the image region that's the closest to the current element size.
  private _findBestFittingRegion(): RectangleImageRegion {
    // Determining the best fitting image region for the current element size.
    let bestRegion = ImageDisplayControl._ORIGINAL_IMAGE_REGION;
    let smallestRatioDiff = this._elementSize.ratioDiffFactor(
      this._fittedImageSize
    );

    // It's only worth looking for an image region if the element ratio and
    // the original image ratio differ enough:
    if (smallestRatioDiff > 1.1) {
      this._rectangleImageRegions.forEach(region => {
        const ratioDiff = this._elementSize.ratioDiffFactor(
          region.size.getSizeInPixels(this._fittedImageSize)
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

  // Sanitized version of the 'data-image-regions' HTML attribute.
  // Populated by _populateRectangleImageRegions().
  private _rectangleImageRegions: RectangleImageRegion[] = [];

  // Observer that watches for changes in the element's attributes.
  private _attributeObserver: MutationObserver = new MutationObserver(
    this._attributeHasChanged.bind(this)
  );

  // Last observed size of the element in pixels. Populated by
  // _observeElementSize().
  private _elementSize = new SizeInPixels();

  // Size of the fitted image in pixels, i.e. size of the image after CSS
  // `object-fit:` has been applied but before we apply `transform:`. Populated
  // by _populateFittedImageSize().
  //
  // The size of the image has been linked to the element size in the
  // constructor by using `object-fit: contain;`. This gives us a base size to
  // apply transformations on, which doesn't depend on `srcset=` and `sizes=`.
  // This simplifies the logic because `sizes=` might be using the `vw` unit,
  // thus we would have to monitor changes to the viewport size in order to
  // recalculate the scaling factor.
  private _fittedImageSize = new SizeInPixels();

  // Margins between the fitted image and the element after CSS
  // `object-fit: contain; object-position: top left;` has been applied but
  // before we apply `transform:`. Populated by _populateFittedImageSize().
  private _fittedImageBottomRightMargin = new SizeInPixels();

  private _logger: Logger = new Logger(this.id, this.dataset.loglevel);
}
