import { Logger } from './Logger.js';
import { PositionInRelativeCoord } from './PositionInRelativeCoord.js';
import {
  ImageRegionFromHtmlAttr,
  RectangleImageRegion,
} from './RectangleImageRegion.js';
import { SizeInPixels } from './SizeInPixels.js';
import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';
import { Transformation } from './Transformation.js';

export class ImageDisplayControl extends HTMLImageElement {
  // See
  // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
  static get observedAttributes() {
    return [
      'id',
      'data-loglevel',
      'data-disabled', // 'none' (default), 'all' or 'css-contain'
      'data-image-regions', // JSON array of image regions
      'data-image-region-id', // forces zooming on a specific image region
      'data-debug-draw-regions', // 'off' (default) or 'on'
    ];
  }

  // Special region representing the entire original image.
  private static readonly _ORIGINAL_IMAGE_REGION = new RectangleImageRegion(
    '<no region>',
    new PositionInRelativeCoord(0, 0),
    new SizeInRelativeCoord(1, 1)
  );

  connectedCallback() {
    this._logger.debug('Connected');
    this._behaviorChanged();
  }

  disconnectedCallback() {
    this._logger.debug('Disconnected');
    this._restoreOriginalParentCssContainment();
  }

  // Called whenever an HTML attribute of the element has changed. Guaranteed
  // to be called at least once for each explicitly set attribute after the
  // element has been created.
  attributeChangedCallback(attributeName: string) {
    switch (attributeName) {
      case 'id':
        this._logger.setId(this.id);
        break;

      case 'data-loglevel':
        this._logger.setLevel(this.dataset.loglevel);
        break;

      case 'data-disabled':
        this._behaviorChanged();
        break;

      case 'data-image-regions':
        if (!this.dataset.disabled) {
          this._populateRectangleImageRegions();
          this._panAndZoomToBestRegion();
        }
        break;

      case 'data-image-region-id':
        if (!this.dataset.disabled) {
          this._panAndZoomToBestRegion();
        }
        break;

      case 'data-debug-draw-regions':
        this._behaviorChanged();
        break;

      default:
        this._logger.warn(`Unexpected attribute mutation: ${attributeName}`);
        break;
    }
  }

  // Called whenever the element should start/stop having some of its intended
  // custom behaviors.
  _behaviorChanged() {
    const debugDrawRegionsStr: string = this.dataset.debugDrawRegions || 'off';
    const debugDrawRegions: boolean =
      debugDrawRegionsStr === 'on' ||
      debugDrawRegionsStr === 'true' ||
      debugDrawRegionsStr === 'yes' ||
      debugDrawRegionsStr === '1' ||
      debugDrawRegionsStr === 'enabled' ||
      debugDrawRegionsStr === 'all';

    const disabled: string = this.dataset.disabled || 'none';
    switch (disabled) {
      case 'all':
      case 'true':
      case 'yes':
        // We should behave like a normal <img> element.
        this._logger.debug('Disabled');
        this._sizeObserver.unobserve(this);
        this._restoreOriginalBorderAndPadding();
        this._removeDebugRegionOverlays();
        this._setCssToMiddleCropOriginalImage();
        this._restoreOriginalParentCssContainment();
        break;

      case 'css-contain':
      case 'css-containment':
        this._logger.debug('Disabled CSS containment only');
        this._restoreOriginalParentCssContainment();

        if (debugDrawRegions) {
          this._recreateDebugRegionOverlays();
          this._panAndZoomToBestRegion();
        } else {
          this._removeDebugRegionOverlays();
        }

        break;

      case 'none':
      case 'false':
      case 'no':
      default:
        this._logger.debug('Enabled');
        this._adaptParentCssContainment();
        this._populateRectangleImageRegions();

        if (debugDrawRegions) {
          this._recreateDebugRegionOverlays();
        } else {
          this._removeDebugRegionOverlays();
        }

        this._panAndZoomToBestRegion();
        this._sizeObserver.observe(this);
        break;
    }
  }

  // Called whenever the element size has changed. Guaranteed to be called at
  // least once after the observer has been started.
  _resizeCallback(entries: ResizeObserverEntry[]) {
    // If several resize events are coming at once, we only want to handle the
    // last one.
    const entry = entries.pop();
    if (!entry) {
      this._logger.warn('No ResizeObserverEntry, spurious call?');
      return;
    }
    if (entry.target !== this) {
      this._logger.warn('Unexpected ResizeObserverEntry target');
      return;
    }

    let newElementSize = new SizeInPixels();
    if (entry.contentBoxSize) {
      // Chrome-specific, see
      // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
      newElementSize = new SizeInPixels(
        entry.contentBoxSize[0].inlineSize,
        entry.contentBoxSize[0].blockSize
      );
    } else {
      newElementSize = new SizeInPixels(
        entry.contentRect.width,
        entry.contentRect.height
      );
    }

    const elementSizeHasChanged =
      this._elementSize.setIfDifferent(newElementSize);

    if (elementSizeHasChanged) {
      this._logger.debug(`Element size: ${this._elementSize}`);
      this._populateFittedImageSize();
      this._panAndZoomToBestRegion();
    }
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
  private _panAndZoomToBestRegion() {
    this._logger.debug('Panning and zooming to best region...');
    if (this._fittedImageSize.isUnknown()) {
      this._logger.debug('Fitted image size unknown, deferring.');
      return;
    }

    let bestRegion = null;
    if (this.dataset.imageRegionId) {
      // The user has manually selected an image region by ID via HTML
      // attribute, let's look for it.
      if (
        this.dataset.imageRegionId ===
        ImageDisplayControl._ORIGINAL_IMAGE_REGION.id
      ) {
        bestRegion = ImageDisplayControl._ORIGINAL_IMAGE_REGION;
      } else {
        bestRegion = this._rectangleImageRegions.find(
          region => region.id === this.dataset.imageRegionId
        );
      }
    }
    if (!bestRegion) {
      bestRegion = this._findBestRegion();
    }

    // Optimization: we let the browser doing the middle-crop by itself if the
    // best region is the original image. However we skip the optimization if
    // the region overlay drawing is enabled, because we need to then perform
    // all the calculations ourselves anyway.
    if (
      ImageDisplayControl._ORIGINAL_IMAGE_REGION.id === bestRegion.id &&
      !this._debugRegionOverlayContainer
    ) {
      this._restoreOriginalBorderAndPadding();
      this._setCssToMiddleCropOriginalImage();
    } else {
      // Stash away the original border and padding:
      if (this._cssBorderToRestore === null) {
        this._cssBorderToRestore = this.style.border;
        this.style.border = 'none';
      }
      if (this._cssPaddingToRestore === null) {
        this._cssPaddingToRestore = this.style.padding;
        this.style.padding = '0';
      }

      const transformation = bestRegion.getTransformation(
        this._elementSize,
        this._fittedImageSize,
        this._fittedImageBottomRightMargin
      );
      this._setCssToPanAndZoomToRegion(transformation);
      if (this._debugRegionOverlayContainer) {
        this._drawDebugRegionOverlays(transformation);
      }
    }
  }

  // Returns the image region that's the closest to the current element size.
  private _findBestRegion(): RectangleImageRegion {
    // Determining the best image region for the current element size.
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

  private _adaptParentCssContainment() {
    this._parentElement = this.parentElement;
    if (this._parentElement) {
      if (
        this._parentElement.style.contain !== 'paint' &&
        this._parentElement.style.contain !== 'layout' &&
        this._parentElement.style.contain !== 'content'
      ) {
        if (this._parentCssContainToRestore === null) {
          this._parentCssContainToRestore = this._parentElement.style.contain;
        }
        this._parentElement.style.contain = 'paint';
      }
    }
  }

  private _restoreOriginalParentCssContainment() {
    if (this._parentElement) {
      if (this._parentCssContainToRestore !== null) {
        this._parentElement.style.contain = this._parentCssContainToRestore;
        this._parentCssContainToRestore = null;
      }
    }
  }

  private _restoreOriginalBorderAndPadding() {
    if (this._cssBorderToRestore !== null) {
      this.style.border = this._cssBorderToRestore;
      this._cssBorderToRestore = null;
    }
    if (this._cssPaddingToRestore !== null) {
      this.style.padding = this._cssPaddingToRestore;
      this._cssPaddingToRestore = null;
    }
  }

  private _setCssToMiddleCropOriginalImage() {
    this.style.objectFit = 'cover';
    this.style.objectPosition = 'center';
    this.style.transformOrigin = '0 0';
    this.style.transform = 'none';
    this.style.clipPath = 'none';
  }

  private _setCssToPanAndZoomToRegion(transformation: Transformation) {
    // Link the original image size to the element size.
    this.style.objectFit = 'contain';
    this.style.objectPosition = 'top left';

    this.style.transformOrigin = `${transformation.origin.x.toFixed(
      3
    )}px ${transformation.origin.y.toFixed(3)}px`;
    this.style.transform = `translate(${-transformation.origin.x.toFixed(
      3
    )}px, ${-transformation.origin.y.toFixed(
      3
    )}px) scale(${transformation.factor.toFixed(3)})`;
    this.style.clipPath =
      `inset(${transformation.insetClipFromTopLeft.getHeight()}px ` +
      `${transformation.insetClipFromBottomRight.getWidth()}px ` +
      `${transformation.insetClipFromBottomRight.getHeight()}px ` +
      `${transformation.insetClipFromTopLeft.getWidth()}px)`;
  }

  private _recreateDebugRegionOverlays() {
    if (this._debugRegionOverlayContainer) {
      this._removeDebugRegionOverlays();
    }
    this._debugRegionOverlayContainer = document.createElement('div');

    // Let the container take no space, so we don't affect the web component's
    // flow:
    this._debugRegionOverlayContainer.style.position = 'absolute';
    this._parentElement?.insertBefore(this._debugRegionOverlayContainer, this);
  }

  private _removeDebugRegionOverlays() {
    if (this._debugRegionOverlayContainer) {
      this._parentElement?.removeChild(this._debugRegionOverlayContainer);
      this._debugRegionOverlayContainer = null;
    }
    this._debugRegionOverlays.clear();
  }

  // Draw/Move all debug region overlays to the correct position according to
  // the given image transformation being performed.
  private _drawDebugRegionOverlays(transformation: Transformation) {
    this._rectangleImageRegions.forEach(region => {
      this._drawDebugRegionOverlay(region, transformation);
    });
  }

  // Create element from this._debugRegionOverlays if it doesn't exist yet.
  // Then move it to the correct position.
  private _drawDebugRegionOverlay(
    region: RectangleImageRegion,
    transformation: Transformation
  ) {
    let overlay = this._debugRegionOverlays.get(region.id);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.boxSizing = 'border-box';
      overlay.style.border = this._pickNextOvelayStyle();
      overlay.style.zIndex = '999';
      this._debugRegionOverlayContainer?.appendChild(overlay);
      this._debugRegionOverlays.set(region.id, overlay);
    }

    const boundingBox = region.getBoundingBox(
      this._elementSize,
      this._fittedImageSize,
      transformation
    );
    overlay.style.left = `${boundingBox.position.x}px`;
    overlay.style.top = `${boundingBox.position.y}px`;
    overlay.style.width = `${boundingBox.size.getWidth()}px`;
    overlay.style.height = `${boundingBox.size.getHeight()}px`;
  }

  private _pickNextOvelayStyle(): string {
    // Remove the first style from the beginning of the array and add it to the
    // end, then return it.
    const defaultStyleInCaseArrayIsEmpty = '5px solid rgba(255, 0, 0, 0.7)';
    const nextStyle =
      this._debugRegionOverlayStyles.shift() || defaultStyleInCaseArrayIsEmpty;
    this._debugRegionOverlayStyles.push(nextStyle);
    return nextStyle;
  }

  // Sanitized version of the 'data-image-regions' HTML attribute.
  // Populated by _populateRectangleImageRegions().
  private _rectangleImageRegions: RectangleImageRegion[] = [];

  // Observer that watches for changes in the element's size.
  private _sizeObserver = new ResizeObserver(this._resizeCallback.bind(this));

  // Last observed size of the element in pixels. Populated by
  // _resizeCallback().
  private _elementSize = new SizeInPixels();

  // Size of the fitted image in pixels, i.e. size of the image after CSS
  // `object-fit:` has been applied but before we apply `transform:`. Populated
  // by _populateFittedImageSize().
  //
  // The size of the image is linked to the element size in the by using
  // `object-fit: contain;`. This gives us a base size to apply transformations
  // on, which doesn't depend on `srcset=` and `sizes=`. This simplifies the
  // logic because `sizes=` might be using the `vw` unit, thus we would have to
  // monitor changes to the viewport size in order to recalculate the scaling
  // factor.
  private _fittedImageSize = new SizeInPixels();

  // Margins between the fitted image and the element after CSS
  // `object-fit: contain; object-position: top left;` has been applied but
  // before we apply `transform:`. Populated by _populateFittedImageSize().
  private _fittedImageBottomRightMargin = new SizeInPixels();

  // We need to remember the parent element as this.parentElement will be null
  // already in the `disconnectedCallback()` and we won't be able to restore
  // the CSS `contain:` property on it if we don't remember it.
  private _parentElement: HTMLElement | null = null;

  // Old CSS `contain:` value that we have touched on our parent and want to
  // restore later.
  //
  // Zooming the image with CSS `transform: scale()` creates an overflowing
  // content, even though we clip it with a `clip-path:`. If none of the
  // ancestors has an `overflow: hidden;` property, one of the ancestors,
  // usually `<body>` will end up having to display scrollbars for this
  // clipped image part, which we don't want. This can be prevented with CSS
  // containment by setting the parent's `contain:` property to `paint`,
  // `layout` or `content`. See:
  // * https://developer.mozilla.org/en-US/docs/Web/CSS/contain
  // * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment
  private _parentCssContainToRestore: string | null = null;

  // Old CSS `border:` and `padding:` values that we have touched and want to
  // restore later.
  //
  // When zooming on a region, we remove borders and padding as:
  // 1. They don't survive zooming and clipping,
  // 2. They wrong our CSS `transform:` calculations.
  // However, when the best region is the original image itself, we rely on
  // the browser to perform a middle-crop by applying `object-fit: cover;` and
  // we restore the borders and padding, as it knows how to handle them.
  private _cssBorderToRestore: string | null = null;
  private _cssPaddingToRestore: string | null = null;

  private _logger: Logger = new Logger(this.id, this.dataset.loglevel);

  // Sibbling element of the web component that we use as a parent to <div>
  // elements displaying regions as overlays over the web component.
  private _debugRegionOverlayContainer: HTMLDivElement | null = null;

  // Map of region ID to <div> element displaying the region as an overlay over
  // the web component.
  private _debugRegionOverlays = new Map<string, HTMLDivElement>();

  // List of `border:` CSS values to be applied alternatively to the debug
  // region overlays.
  private _debugRegionOverlayStyles: string[] = [
    '5px solid rgba(240, 69, 141, 0.7)',
    '5px solid rgba(127, 15, 130, 0.7)',
    '5px solid rgba(48, 0, 150, 0.7)',
  ];
}
