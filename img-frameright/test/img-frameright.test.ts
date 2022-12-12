import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ImgFrameright } from '../src/ImgFrameright.js';
import '../src/img-frameright.js';

describe('ImgFrameright', () => {
  it('can set the id via attribute', async () => {
    const el = await fixture<ImgFrameright>(
      html`<img-frameright id="myid"></img-frameright>`
    );

    expect(el._id).to.equal('myid');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<ImgFrameright>(
      html`<img-frameright></img-frameright>`
    );

    expect(el).shadowDom.to.be.accessible();
  });
});
