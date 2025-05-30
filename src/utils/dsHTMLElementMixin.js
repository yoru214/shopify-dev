import { HTMLElementMixin } from './htmlElementMixin.js';

export const DSHTMLElementMixin = (Base) =>
	class extends HTMLElementMixin(Base) {
		connectedCallback() {
			if (super.connectedCallback) super.connectedCallback();
			this.dynamicSection = this.closest('dynamic-section');

			if (!this.dynamicSection) {
				console.warn(
					`[DSHTMLElementMixin] No <dynamic-section> found for ${this.tagName.toLowerCase()}`,
				);
			}
		}
	};
