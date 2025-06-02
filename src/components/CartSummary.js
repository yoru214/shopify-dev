import { ThemeEvent } from '../utils/themeEvent.js';

class CartSummary extends HTMLElement {
	connectedCallback() {
		this._onReload = this.reload.bind(this);
		ThemeEvent.on('cart:item:added', this._onReload);
		ThemeEvent.on('cart:item:updated', this._onReload);
		ThemeEvent.on('cart:item:removed', this._onReload);
	}

	disconnectedCallback() {
		ThemeEvent.off('cart:item:added', this._onReload);
		ThemeEvent.off('cart:item:updated', this._onReload);
		ThemeEvent.off('cart:item:removed', this._onReload);
	}

	async reload() {
		try {
			const res = await fetch('/cart?section_id=render-cart-summary');
			if (!res.ok) throw new Error('Failed to fetch cart table section');

			const html = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// Get all nodes inside <body> of parsed response
			const fragment = document.createDocumentFragment();
			doc.body.childNodes.forEach((node) => fragment.appendChild(node));

			this.replaceChildren(fragment);
		} catch (err) {
			console.error('[CartSummary] Reload failed:', err);
		}
	}
}

customElements.define('cart-summary', CartSummary);
