import { PositionInPixels } from './PositionInPixels.js';
import { SizeInPixels } from './SizeInPixels.js';

export interface ImageRegionFromHtmlAttr {
  id?: string;
  shape?: string;
  absolute?: boolean;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
}

export class RectangleImageRegion {
  constructor(id?: string) {
    if (id) {
      this.id = id;
      this._unknown = false;
    }
  }

  // Sets the fields according to the values coming from HTML attributes. The
  // provided position and size may be absolute, i.e. expressed in pixels, or
  // relative, i.e. expressed as a fraction of a given base size.
  setFields(values: ImageRegionFromHtmlAttr, baseSize: SizeInPixels) {
    if (
      values.shape == null ||
      values.absolute == null ||
      values.x == null ||
      values.y == null ||
      values.width == null ||
      values.height == null
    ) {
      this._unknown = true;
      return;
    }

    if (values.shape.toLowerCase() !== 'rectangle') {
      this._unknown = true;
      return;
    }

    let x: number = parseFloat(`${values.x}`);
    let y: number = parseFloat(`${values.y}`);
    let width: number = parseFloat(`${values.width}`);
    let height: number = parseFloat(`${values.height}`);
    if (
      Number.isNaN(x) ||
      Number.isNaN(y) ||
      Number.isNaN(width) ||
      Number.isNaN(height)
    ) {
      this._unknown = true;
      return;
    }

    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      this._unknown = true;
      return;
    }

    if (!values.absolute) {
      if (baseSize.isUnknown()) {
        this._unknown = true;
        return;
      }
      x *= baseSize.getWidth();
      y *= baseSize.getHeight();
      width *= baseSize.getWidth();
      height *= baseSize.getHeight();
    }

    this.id = values.id ?? window.crypto.randomUUID();
    this.position = new PositionInPixels(x, y);
    this.size = new SizeInPixels(width, height);
    this._unknown = false;
  }

  isUnknown() {
    return this._unknown;
  }

  // Returns the necessary scaling factor and origin to apply via CSS in order
  // to pan and zoom on this region.
  getCssScaling(
    currentComponentSize: SizeInPixels,
    originalImageRegionSize: SizeInPixels
  ) {
    const regionX = this.position.getX();
    const regionY = this.position.getY();
    const regionWidth = this.size.getWidth();
    const regionHeight = this.size.getHeight();
    const componentWidth = currentComponentSize.getWidth();
    const componentHeight = currentComponentSize.getHeight();
    const originalImageWidth = originalImageRegionSize.getWidth();
    const originalImageHeight = originalImageRegionSize.getHeight();

    let xOffset = 0;
    let yOffset = 0;
    let scaleFactor = 1;
    if (currentComponentSize.getRatio() < this.size.getRatio()) {
      // Here the region to focus on has a higher width/height ratio than the
      // component, i.e. the region is "flatter". This means that we need to
      // zoom the region in order to render both boxes with exactly the same
      // width:
      //
      //   +----------------------------------------+  <---
      //   | component / image around region        |    | yOffset
      //   |                                        |    |
      //   +----------------------------------------+  <---
      //   | region                                 |
      //   |                                        |
      //   |                                        |
      //   +----------------------------------------+
      //   |                                        |
      //   | component / image around region        |
      //   +----------------------------------------+
      //   ^
      //   | xOffset = 0

      scaleFactor = componentWidth / regionWidth;
      yOffset = Math.round((componentHeight / scaleFactor - regionHeight) / 2);

      // On extreme ratios, the calculations above lead to an extreme zooming
      // out, leading to blank margins appearing, either
      //
      //   * at the top:
      //
      //     +---------------------------------+  <---
      //     | component / no image            |    | yOffset > regionY
      //     |                                 |    |
      //     +---------------------------------+  <-|-----
      //     | component / image around region |    |   | regionY
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
      // Depending which one of regionY and regionYFromBottom, the problem will
      // appear first at the top or at the bottom of the image.

      const blankAtTop = yOffset - regionY;
      const regionYFromBottom = originalImageHeight - regionHeight - regionY;
      const blankAtBottom = yOffset - regionYFromBottom;

      if (blankAtTop > 0 || blankAtBottom > 0) {
        // We are about to zoom out too much. If we don't fix this here, some
        // blank margin will appear either at the top or at the bottom.
        // Let's zoom less and perform a middle-cropping.
        // Note that this is similar to the `object-fit: cover;` behavior, which
        // can only be applied to the entire image unfortunately.

        // Take back yOffset to its maximum allowed:
        yOffset = Math.min(regionY, regionYFromBottom);

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
        xOffset = Math.round((componentWidth / scaleFactor - regionWidth) / 2);
      }
    } else {
      // Same calculations as in the other code branch, but simply having
      // swapped the X and Y axes.
      scaleFactor = componentHeight / regionHeight;
      xOffset = Math.round((componentWidth / scaleFactor - regionWidth) / 2);
      const blankAtLeft = xOffset - regionX;
      const regionXFromRight = originalImageWidth - regionWidth - regionX;
      const blankAtRight = xOffset - regionXFromRight;
      if (blankAtLeft > 0 || blankAtRight > 0) {
        xOffset = Math.min(regionX, regionXFromRight);
        scaleFactor = componentWidth / (xOffset * 2 + regionWidth);
        yOffset = Math.round(
          (componentHeight / scaleFactor - regionHeight) / 2
        );
      }
    }

    return {
      origin: new PositionInPixels(regionX - xOffset, regionY - yOffset),
      factor: scaleFactor,
    };
  }

  id = '';
  position = new PositionInPixels();
  size = new SizeInPixels();

  _unknown = true;
}
