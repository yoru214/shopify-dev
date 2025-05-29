import { ThemeEvent } from '../utils/themeEvent.js';

class UpdateCartItem extends HTMLElement {
	constructor() {
		super();
		this.button = null;
		this.form = null;
		this.originalVariantId = null;
		this._onClick = this.onClick.bind(this);
		this.line = this.getAttribute('cart_line');
		this.originalVariantId = this.getAttribute('variant_id');
	}

	connectedCallback() {
		const params = new URLSearchParams(window.location.search);
		const vid = params.get('variant_id');
		const i = params.get('index');

		console.log('variant:', vid); // "123"
		console.log('index:', i); // "homepage"

		this.button = this.querySelector('button');
		this.form = this.closest('form');

		if (!this.form || !this.button) {
			console.warn(
				'<update-cart-item> must be inside a form and contain a <button>',
			);
			return;
		}

		// Capture the original variant ID only once when component is mounted
		const initialFormData = new FormData(this.form);

		this.button.addEventListener('click', this._onClick);
	}

	disconnectedCallback() {
		if (this.button) {
			this.button.removeEventListener('click', this._onClick);
		}
	}

	async onClick(e) {
		e.preventDefault();
		console.log('asdad');
		const formData = new FormData(this.form);
		const newVariantId = formData.get('id');
		const quantity = formData.get('quantity');

		if (!newVariantId || !quantity) {
			alert('Missing variant or quantity.');
			return;
		}

		this.button.disabled = true;
		this.button.textContent = 'Updating...';

		try {
			// Remove old variant if it changed
			if (
				this.originalVariantId &&
				this.originalVariantId !== newVariantId
			) {
				await fetch('/cart/change.js', {
					method: 'POST',
					headers: { Accept: 'application/json' },
					body: new URLSearchParams({
						line: this.line,
						quantity: 0,
					}),
				});

				// Add new variant
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

			ThemeEvent.emit('cart:item:updated', {});
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
