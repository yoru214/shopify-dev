import { ThemeEvent } from '../utils/themeEvent.js';

class CartItemEditButton extends HTMLElement {
	connectedCallback() {
		this.addEventListener('click', this.onClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.onClick);
	}

	onClick = (e) => {
		e.preventDefault();

		const productHandle = this.getAttribute('product-handle');
		const variantId = this.getAttribute('variant-id');
		const quantity = this.getAttribute('quantity') || '1';
		const line = this.getAttribute('line');

		if (!productHandle || !variantId) return;

		const url = `/products/${productHandle}?section_id=cart-item-editor&variant_id=${variantId}&qty=${quantity}&line=${line}`;

		ThemeEvent.emit('modal:cart:item:edit', { url });
	};
}

customElements.define('cart-item-edit-button', CartItemEditButton);
