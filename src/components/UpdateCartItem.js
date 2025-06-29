import { ThemeEvent } from '../utils/themeEvent.js';

class UpdateCartItem extends HTMLElement {
	constructor() {
		super();
		this.button = null;
		this.form = null;
		this._onClick = this.onClick.bind(this);
		this.line = this.getAttribute('cart_line');
		this.slotEl = document.querySelector('[data-modal-slot]');
		this.originalVariantId = this.slotEl.dataset.variantId || null;
		this.orignalIndex = this.slotEl.dataset.index || null;
		this.orignalQuantity = this.slotEl.dataset.qty || 1;
	}

	connectedCallback() {
		this.button = this.querySelector('button');
		this.form = this.closest('form');

		if (!this.form || !this.button) {
			console.warn(
				'<update-cart-item> must be inside a form and contain a <button>',
			);
			return;
		}

		this.button.addEventListener('click', this._onClick);
	}

	disconnectedCallback() {
		if (this.button) {
			this.button.removeEventListener('click', this._onClick);
		}
	}

	async onClick(e) {
		e.preventDefault();
		const formData = new FormData(this.form);
		const newVariantId = formData.get('id');
		const quantity = formData.get('quantity');
		const line = this.orignalIndex;

		if (!newVariantId || !quantity) {
			alert('Missing variant or quantity.');
			return;
		}

		this.button.disabled = true;
		this.button.textContent = 'Updating...';

		try {
			if (
				this.originalVariantId &&
				this.originalVariantId !== newVariantId
			) {
				// Remove original variant
				await fetch('/cart/change.js', {
					method: 'POST',
					headers: {
						Accept: 'application/json',
					},
					body: new URLSearchParams({
						line,
						quantity: 0,
					}),
				});
				// Add new Variant
				const res = await fetch('/cart/add.js', {
					method: 'POST',
					headers: { Accept: 'application/json' },
					body: new URLSearchParams({
						id: newVariantId,
						quantity: quantity,
					}),
				});

				if (!res.ok) throw new Error('Failed to add updated item');
			} else {
				const res = await fetch('/cart/change.js', {
					method: 'POST',
					headers: { Accept: 'application/json' },
					body: new URLSearchParams({
						id: newVariantId,
						quantity: quantity,
					}),
				});
			}

			ThemeEvent.emit('cart:item:updated', { data: 'cart updated' });
			ThemeEvent.emit('toast:show', {
				message: `Cart Successfully updated`,
				duration: 3000,
			});

			this.button.textContent = 'Updated';
			setTimeout(() => {
				this.button.textContent = 'Update';
				this.button.disabled = false;
			}, 1000);
		} catch (err) {
			console.error('[UpdateCartItem] Failed', err);
			this.button.disabled = false;
			this.button.textContent = 'Update';
		}
	}
}

customElements.define('update-cart-item-button', UpdateCartItem);
