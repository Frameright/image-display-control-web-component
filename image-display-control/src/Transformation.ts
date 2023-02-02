import { PositionInPixels } from './PositionInPixels.js';
import { SizeInPixels } from './SizeInPixels.js';

// Represents a transformation to be applied via CSS to the image in order to
// zoom in on a region.
export interface Transformation {
  origin: PositionInPixels;
  factor: number; // scale factor

  // See https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/inset
  insetClipFromTopLeft: SizeInPixels;
  insetClipFromBottomRight: SizeInPixels;
}
