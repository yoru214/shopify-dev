import { ThemeEvent } from '../utils/themeEvent.js';
class CartNotification extends HTMLElement {
	connectedCallback() {
		console.log('loaded');
		this.displayValuesFromURL();
	}

	displayValuesFromURL() {
		const slot = this.closest('[data-modal-slot]');
		if (!slot) return;

		const price = slot.dataset.price;
		const quantity = slot.dataset.qty;
		const color = slot.dataset.color;
		const variant_id = slot.dataset.variantId;

		const priceEl = this.querySelector('total-price');
		const quantityEl = this.querySelector('total-quantity');

		if (price && priceEl) {
			priceEl.textContent = `Price: ${this.formatPrice(price)}`;
		}

		if (quantity && quantityEl) {
			quantityEl.textContent = `Quantity: ${quantity}`;
		}

		console.log('emit:', variant_id);
		ThemeEvent.emit('product:media:scrollToVariant', {
			variant_id: variant_id,
		});
	}

	formatPrice(value) {
		const floatVal = parseFloat(value);
		if (isNaN(floatVal)) return value;

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'PHP',
		}).format(floatVal / 100);

		const amount = (cents / 100).toFixed(2);
		return `₱${amount}`;
	}
}

customElements.define('cart-notification', CartNotification);
