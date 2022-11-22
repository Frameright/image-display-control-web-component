import { html, css, LitElement, CSSResult, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export class ImgFrameright extends LitElement {
  static styles: CSSResult = css`
    :host {
      display: block;
      padding: 25px;
      background-color: #ccc;
    }
  `;

  @property()
  src: string = '';

  @property()
  alt: string = '';

  render(): TemplateResult[] {
    const result: TemplateResult[] = [];

    if (this.src) {
      result.push(html`<img src="${this.src}" alt="${this.alt}" />`);
    }

    return result;
  }
}
