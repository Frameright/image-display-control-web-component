import { html, css, LitElement, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// See https://stackoverflow.com/questions/34727936/typescript-bracket-notation-property-access
interface AccessAnyMemberByName {
  [key: string]: any;
}

export class ImgFrameright extends LitElement {
  static styles: CSSResult = css`
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  render() {
    let htmlAttrs = '';
    ImgFrameright.supportedHtmlAttrs.forEach((propName, attrName) => {
      const propValue = (this as AccessAnyMemberByName)[propName];
      if (propValue !== null) {
        htmlAttrs += ` ${attrName}="${propValue}"`;
      }
    });

    return unsafeHTML(`<img ${htmlAttrs.trim()} />`);
  }

  // Full list of supported HTML attributes. Will be populated by the
  // @htmlAttrProp() decorators. Maps attribute names to property names.
  static supportedHtmlAttrs: Map<string, string> = new Map();

  // All <img>-specific HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
  @htmlAttrProp('alt', 'alt') alt = null;
  @htmlAttrProp('crossorigin', 'crossorigin') crossorigin = null;
  @htmlAttrProp('decoding', 'decoding') decoding = null;
  @htmlAttrProp('fetchpriority', 'fetchpriority') fetchpriority = null;
  @htmlAttrProp('height', 'height') height = null;
  @htmlAttrProp('ismap', 'ismap') ismap = null;
  @htmlAttrProp('loading', 'loading') loading = null;
  @htmlAttrProp('referrerpolicy', 'referrerpolicy') referrerpolicy = null;
  @htmlAttrProp('sizes', 'sizes') sizes = null;
  @htmlAttrProp('src', 'src') src = null;
  @htmlAttrProp('srcset', 'srcset') srcset = null;
  @htmlAttrProp('width', 'width') width = null;
  @htmlAttrProp('usemap', 'usemap') usemap = null;

  // Relevant global HTML attributes, see
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  @htmlAttrProp('accesskey', 'accesskey') accesskey = null;
  @htmlAttrProp('autofocus', 'autofocus_') autofocus_ = null;
  @htmlAttrProp('contextmenu', 'contextmenu') contextmenu = null;
  @htmlAttrProp('dir', 'dir_') dir_ = null;
  @htmlAttrProp('enterkeyhint', 'enterkeyhint') enterkeyhint = null;
  @htmlAttrProp('hidden', 'hidden_') hidden_ = null;
  @htmlAttrProp('inert', 'inert_') inert_ = null;
  @htmlAttrProp('is', 'is') is = null;
  @htmlAttrProp('itemid', 'itemid') itemid = null;
  @htmlAttrProp('itemprop', 'itemprop') itemprop = null;
  @htmlAttrProp('itemref', 'itemref') itemref = null;
  @htmlAttrProp('itemscope', 'itemscope') itemscope = null;
  @htmlAttrProp('itemtype', 'itemtype') itemtype = null;
  @htmlAttrProp('lang', 'lang_') lang_ = null;
  @htmlAttrProp('nonce', 'nonce_') nonce_ = null;
  @htmlAttrProp('part', 'part_') part_ = null;
  @htmlAttrProp('role', 'role') role = null;
  @htmlAttrProp('spellcheck', 'spellcheck_') spellcheck_ = null;
  @htmlAttrProp('style', 'style_') style_ = null;
  @htmlAttrProp('tabindex', 'tabindex') tabindex = null;
  @htmlAttrProp('title', 'title_') title_ = null;
  @htmlAttrProp('translate', 'translate_') translate_ = null;
}

function htmlAttrProp(htmlAttrName: string, propName: string) {
  // Populate the full supported HTML attributes...
  ImgFrameright.supportedHtmlAttrs.set(htmlAttrName, propName);

  // ... then call the standard Lit @property decorator:
  return property({ attribute: htmlAttrName });
}
