import { ThemeEvent } from '../utils/themeEvent.js';

class ProductCard extends HTMLElement {
	connectedCallback() {
		if (!this.initialize()) return false;
		this.bindEvents();
	}

	disconnectedCallback() {
		if (this.button) {
			this.button.removeEventListener('click', this._onPreviewClick);
		}
	}

	initialize() {
		this.handle = this.dataset.handle;

		if (!this.handle) {
			console.warn('[ProductCard] Missing data-handle');
			return false;
		}
		return true;
	}

	bindEvents() {
		this.button = this.querySelector('button[type="submit"]');
		if (this.button) {
			this._onPreviewClick = this.onPreviewClick.bind(this);
			this.button.addEventListener('click', this._onPreviewClick);
		}
	}

	onPreviewClick(e) {
		e.preventDefault();
		ThemeEvent.emit('modal:product:preview', {
			url: `/products/${this.handle}?section_id=render-product-preview`,
		});
	}
}

customElements.define('product-card', ProductCard);
