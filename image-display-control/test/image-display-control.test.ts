import { fixture, expect, html } from '@open-wc/testing';
import { ImageDisplayControl } from '../src/ImageDisplayControl.js';
import '../src/image-display-control.js';

describe('ImageDisplayControl', () => {
  it('detects browser features', async () => {
    const element = await fixture<ImageDisplayControl>(
      html`<img is="image-display-control" alt="description" />`,
    );

    expect(element._getInternal('this._browserFeatures')).to.deep.equal({
      cssInset: true,
      resizeObserver: true,
      cssContain: true,
    });
  });
});
