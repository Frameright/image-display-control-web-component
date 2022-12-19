import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ImageDisplayControl } from '../src/ImageDisplayControl.js';
import '../src/image-display-control.js';

describe('ImageDisplayControl', () => {
  it('can set the id via attribute', async () => {
    const el = await fixture<ImageDisplayControl>(
      html`<image-display-control id="myid"></image-display-control>`
    );

    expect(el._id).to.equal('myid');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<ImageDisplayControl>(
      html`<image-display-control></image-display-control>`
    );

    expect(el).shadowDom.to.be.accessible();
  });
});
