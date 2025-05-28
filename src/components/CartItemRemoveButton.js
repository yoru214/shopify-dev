import { ThemeEvent } from '../utils/themeEvent.js';

class CartItemRemoveButton extends HTMLElement {
	connectedCallback() {
		this._onClick = this.onClick.bind(this);
		this.addEventListener('click', this._onClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this._onClick);
	}

	async onClick(e) {
		e.preventDefault();

		const line = this.getAttribute('line');
		if (!line) {
			console.warn('[CartItemRemoveButton] Missing line attribute.');
			return;
		}

		try {
			const res = await fetch('/cart/change.js', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
				},
				body: new URLSearchParams({
					line,
					quantity: 0,
				}),
			});

			if (!res.ok) throw new Error('Remove failed');

			const updatedCart = await res.json();
			ThemeEvent.emit('cart:item:removed', { updatedCart });
			ThemeEvent.emit('toast:show', {
				message: `Cart Item Successfully removed`,
				duration: 3000,
			});
		} catch (err) {
			console.error('[CartItemRemoveButton] Failed', err);
			alert('Failed to remove item.');
		}
	}
}

customElements.define('cart-item-remove-button', CartItemRemoveButton);
