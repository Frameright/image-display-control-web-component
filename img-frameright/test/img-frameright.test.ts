import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ImgFrameright } from '../src/ImgFrameright.js';
import '../src/img-frameright.js';

describe('ImgFrameright', () => {
  it('can set the src via attribute', async () => {
    const el = await fixture<ImgFrameright>(
      html`<img-frameright src="myimage.jpg"></img-frameright>`
    );

    expect(el.src).to.equal('myimage.jpg');
  });

  it('can set the alt via attribute', async () => {
    const el = await fixture<ImgFrameright>(
      html`<img-frameright src="myimage.jpg" alt="My image"></img-frameright>`
    );

    expect(el.alt).to.equal('My image');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<ImgFrameright>(
      html`<img-frameright></img-frameright>`
    );

    expect(el).shadowDom.to.be.accessible();
  });
});
