import { ThemeEvent } from '../utils/themeEvent.js';

class AddToCart extends HTMLElement {
	connectedCallback() {
		if (!this.inititalize()) return;
		this.bindEvents();
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	inititalize() {
		this.form = this.closest('form');

		if (!this.form) {
			console.error(`[AddToCart] Could not find parent <form>`);
			return false;
		}

		return true;
	}

	bindEvents() {
		this._onAddToCartClick = this.onAddToCartClick.bind(this);
		this.addEventListener('click', this._onAddToCartClick);
	}
	unbindEvents() {
		this.removeEventListener('click', this._onAddToCartClick);
	}

	onAddToCartClick(e) {
		const button = e.target.closest('button[type="submit"]');
		if (!button) return;

		e.preventDefault();

		button.disabled = true;
		button.classList.add('opacity-50', 'cursor-not-allowed');
		const originalText = button.textContent;
		button.textContent = 'Adding...';

		const form = this.closest('form');
		const formData = new FormData(form);

		fetch('/cart/add.js', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: formData,
		})
			.then((res) => {
				if (!res.ok) throw new Error('Add to cart failed');
				return res.json();
			})
			.then((data) => {
				console.log(data);
				let color = '';
				if (
					Array.isArray(data.variant_options) &&
					data.variant_options.length > 0
				) {
					color = data.variant_options[0];
				}

				const url = `/products/${data.handle}?section_id=render-cart-item-added&variant_id=${data.variant_id}&qty=${data.quantity}&price=${data.line_price}&color=${color}`;

				ThemeEvent.emit('modal:cart:item:edit', { url, data });
			})
			.catch((err) => {
				console.error('[AddToCart] Error:', err);
			})
			.finally(() => {
				button.disabled = false;
				button.classList.remove('opacity-50', 'cursor-not-allowed');
				button.textContent = originalText;
			});
	}
}

customElements.define('add-to-cart', AddToCart);
