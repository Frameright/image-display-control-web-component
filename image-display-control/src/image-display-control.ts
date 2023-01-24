// Polyfill for Safari, see https://github.com/ungap/custom-elements
import '@ungap/custom-elements';

import { ImageDisplayControl } from './ImageDisplayControl.js';

window.customElements.define('image-display-control', ImageDisplayControl, {
  extends: 'img',
});
