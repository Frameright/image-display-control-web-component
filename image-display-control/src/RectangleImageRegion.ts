import { Logger } from './Logger.js';
import { PositionInPixels } from './PositionInPixels.js';
import { PositionInRelativeCoord } from './PositionInRelativeCoord.js';
import { SizeInPixels } from './SizeInPixels.js';
import { SizeInRelativeCoord } from './SizeInRelativeCoord.js';

export interface ImageRegionFromHtmlAttr {
  id?: string;
  shape?: string; // only 'rectangle' is supported
  unit?: string; // 'relative' or 'pixel'
  imageWidth?: number | string; // in pixels, required when unit is 'relative'
  imageHeight?: number | string; // in pixels, required when unit is 'relative'
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
}

export class RectangleImageRegion {
  constructor(
    id?: string,
    position?: PositionInRelativeCoord,
    size?: SizeInRelativeCoord
  ) {
    this.id = id ?? '';
    this.position = position ?? new PositionInRelativeCoord();
    this.size = size ?? new SizeInRelativeCoord();
    this._unknown = !position || !size;
  }

  // Sets the fields according to the values coming from HTML attributes.
  setFields(values: ImageRegionFromHtmlAttr, logger: Logger) {
    const shape = values.shape ? values.shape.toLowerCase() : 'rectangle';
    if (shape !== 'rectangle') {
      logger.debug(`Region ${values.id} has unknown shape ${shape}, skipping.`);
      this._unknown = true;
      return;
    }

    let unit = values.unit?.toLowerCase();
    if (!unit) {
      if (values.imageWidth && values.imageHeight) {
        unit = 'pixel';
      } else if (!values.imageWidth && !values.imageHeight) {
        unit = 'relative';
      }
    }
    if (unit !== 'relative' && unit !== 'pixel') {
      logger.debug(`Region ${values.id} has unknown unit ${unit}, skipping.`);
      this._unknown = true;
      return;
    }

    let baseSize = new SizeInPixels();
    if (unit === 'pixel') {
      if (values.imageWidth == null || values.imageHeight == null) {
        logger.warn(
          `Region ${values.id} has missing imageWidth or imageHeight, skipping.`
        );
        this._unknown = true;
        return;
      }
      baseSize = new SizeInPixels(
        parseFloat(`${values.imageWidth}`),
        parseFloat(`${values.imageHeight}`)
      );
    }

    if (
      values.x == null ||
      values.y == null ||
      values.width == null ||
      values.height == null
    ) {
      logger.warn(
        `Region ${values.id} has missing x, y, width or height, skipping.`
      );
      this._unknown = true;
      return;
    }

    const x: number = parseFloat(`${values.x}`);
    const y: number = parseFloat(`${values.y}`);
    const width: number = parseFloat(`${values.width}`);
    const height: number = parseFloat(`${values.height}`);
    if (
      Number.isNaN(x) ||
      Number.isNaN(y) ||
      Number.isNaN(width) ||
      Number.isNaN(height)
    ) {
      logger.warn(
        `Region ${values.id} has non-numeric x, y, width or height, skipping.`
      );
      this._unknown = true;
      return;
    }

    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      logger.warn(
        `Region ${values.id} has negative/zero x, y, width or height, skipping.`
      );
      this._unknown = true;
      return;
    }

    if (unit === 'relative') {
      this.position = new PositionInRelativeCoord(x, y);
      this.size = new SizeInRelativeCoord(width, height);
    } else {
      this.position = new PositionInPixels(x, y).getRelativeCoord(baseSize);
      this.size = new SizeInPixels(width, height).getRelativeCoord(baseSize);
    }

    this.id = values.id ?? window.crypto.randomUUID();
    this._unknown = false;
  }

  isUnknown() {
    return this._unknown;
  }

  // Returns the necessary scaling factor and origin, and clipping to apply via
  // CSS in order to pan and zoom on this region.
  getCssTransformation(
    currentComponentSize: SizeInPixels, // component = <img> element
    originalImageRegionSize: SizeInPixels,
    bottomRightClipMargins: SizeInPixels
  ) {
    const regionPos = this.position.getPositionInPixels(
      originalImageRegionSize
    );
    const regionSize = this.size.getSizeInPixels(originalImageRegionSize);
    const regionWidth = regionSize.getSafeWidth();
    const regionHeight = regionSize.getSafeHeight();
    const componentWidth = currentComponentSize.getSafeWidth();
    const componentHeight = currentComponentSize.getSafeHeight();
    const originalImageWidth = originalImageRegionSize.getWidth();
    const originalImageHeight = originalImageRegionSize.getHeight();

    const regionXFromRight = originalImageWidth - regionWidth - regionPos.x;
    const regionYFromBottom = originalImageHeight - regionHeight - regionPos.y;

    let xOffset = 0;
    let yOffset = 0;
    let scaleFactor = 1;
    if (currentComponentSize.getSafeRatio() < regionSize.getSafeRatio()) {
      // Here the region to focus on has a higher width/height ratio than the
      // component, i.e. the region is "flatter". This means that we need to
      // zoom the region in order to render both boxes with exactly the same
      // width:
      //
      //   +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
      //   | invisible image outside the component                               |             |
      //                                                                         |
      //   |           +----------------------------------------+  <---          | regionPos   |
      //               | component / image around region        |    | yOffset   |   .y
      //   |           |                                        |    |           |             |
      //               +----------------------------------------+  <---------------
      //   |           | region                                 |                              |
      //               |                                        |
      //   |           |                                        |                              |
      //               +----------------------------------------+
      //   |           |                                        |                              |
      //               | component / image around region        |
      //   |           +----------------------------------------+                              |
      //               ^
      //   |           | xOffset = 0                                                           |
      //               |
      //   |           |                                                                       |
      //   +- - - - - -|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
      //   ^           |
      //   |-----------|
      //   | regionPos |
      //       .x
      //
      // As we can see, the image will be shifted to the left, compared to the
      // compoment's origin (its top left corner), by regionPos.x, so that the
      // left side of the region and the left side of the component coincide.
      // If we then shifted the image to the top by regionPos.y, the top side
      // of the region and the top side of the component would coincide, but
      // instead we want the region's center and the component's center to
      // coincide. So the image will be shifted up by (regionPos.y - yOffset)
      // instead.

      scaleFactor = componentWidth / regionWidth;
      yOffset = (componentHeight / scaleFactor - regionHeight) / 2;

      // On extreme ratios, the calculations above lead to an extreme zooming
      // out, leading to blank margins appearing, either
      //
      //   * at the top:
      //
      //     +---------------------------------+  <---
      //     | component / no image            |    | yOffset > regionPos.y
      //     |                                 |    |
      //     +---------------------------------+  <-|-----
      //     | component / image around region |    |   | regionPos.y
      //     |                                 |    |   |
      //     +---------------------------------+  <-------
      //     | region                          |
      //     +---------------------------------+  <---
      //     |                                 |    | yOffset
      //     |                                 |    |
      //     |                                 |    |
      //     |                                 |    |
      //     | component / image around region |    |
      //     +---------------------------------+  <---
      //
      //   * or at the bottom:
      //
      //     +---------------------------------+  <---
      //     | component / image around region |    | yOffset
      //     |                                 |    |
      //     |                                 |    |
      //     |                                 |    |
      //     |                                 |    |
      //     +---------------------------------+  <---
      //     | region                          |
      //     +---------------------------------+  <-------
      //     |                                 |    |   | regionYFromBottom
      //     | component / image around region |    |   |
      //     +---------------------------------+  <-|-----
      //     |                                 |    |
      //     | component / no image            |    | yOffset > regionYFromBottom
      //     +---------------------------------+  <---
      //
      // Depending which one of regionPos.y and regionYFromBottom is greater
      // than yOffset, the problem will appear first at the top or at the bottom
      // of the image.

      const blankAtTop = yOffset - regionPos.y;
      const blankAtBottom = yOffset - regionYFromBottom;

      if (blankAtTop > 0 || blankAtBottom > 0) {
        // We are about to zoom out too much. If we don't fix this here, some
        // blank margin will appear either at the top or at the bottom.
        // Let's zoom less and perform a middle-cropping.
        // Note that this is similar to the `object-fit: cover;` behavior, which
        // can only be applied to the entire image unfortunately.

        // Take back yOffset to its maximum allowed:
        yOffset = Math.min(regionPos.y, regionYFromBottom);

        // Now we know from the original yOffset calculation the following
        // equation:
        //
        //   yOffset === (componentHeight / scaleFactor - regionHeight) / 2
        //
        // which now becomes:
        //
        //   yOffset * 2 === componentHeight / scaleFactor - regionHeight
        //   yOffset * 2 + regionHeight === componentHeight / scaleFactor
        //   (yOffset * 2 + regionHeight) / componentHeight === 1 / scaleFactor
        scaleFactor = componentHeight / (yOffset * 2 + regionHeight);

        // Now center the region on the X axis, in order to middle-crop. Note
        // the similarity with the original yOffset formula.
        xOffset = (componentWidth / scaleFactor - regionWidth) / 2;
      }
    } else {
      // Same calculations as in the other code branch, but simply having
      // swapped the X and Y axes.
      scaleFactor = componentHeight / regionHeight;
      xOffset = (componentWidth / scaleFactor - regionWidth) / 2;
      const blankAtLeft = xOffset - regionPos.x;
      const blankAtRight = xOffset - regionXFromRight;
      if (blankAtLeft > 0 || blankAtRight > 0) {
        xOffset = Math.min(regionPos.x, regionXFromRight);
        scaleFactor = componentWidth / (xOffset * 2 + regionWidth);
        yOffset = (componentHeight / scaleFactor - regionHeight) / 2;
      }
    }

    const origin = new PositionInPixels(
      regionPos.x - xOffset,
      regionPos.y - yOffset
    );

    return {
      origin,
      factor: scaleFactor,

      // See https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/inset
      insetClipFromTopLeft: new SizeInPixels(origin.x, origin.y),
      insetClipFromBottomRight: new SizeInPixels(
        regionXFromRight - xOffset + bottomRightClipMargins.getWidth(),
        regionYFromBottom - yOffset + bottomRightClipMargins.getHeight()
      ),
    };
  }

  id: string;
  position: PositionInRelativeCoord;
  size: SizeInRelativeCoord;

  _unknown: boolean;
}
