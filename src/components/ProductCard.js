import { ThemeEvent } from '../utils/themeEvent.js';

class ProductCard extends HTMLElement {
	connectedCallback() {
		this.handle = this.dataset.handle;

		if (!this.handle) {
			console.warn('[ProductCard] Missing data-handle');
			return;
		}

		this.button = this.querySelector('button[type="submit"]');
		if (this.button) {
			this._onPreviewClick = this.onPreviewClick.bind(this);
			this.button.addEventListener('click', this._onPreviewClick);
		}
	}

	disconnectedCallback() {
		if (this.button) {
			this.button.removeEventListener('click', this._onPreviewClick);
		}
	}

	onPreviewClick(e) {
		e.preventDefault(); // prevent form submission
		ThemeEvent.emit('modal:product:preview', {
			url: `/products/${this.handle}?section_id=product-preview`,
		});
	}
}

customElements.define('product-card', ProductCard);
