import { ThemeEvent } from '../utils/themeEvent.js';

class ItemButton extends HTMLElement {
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
		this.button = this.querySelector('button');
		this.form = this.closest('form');
		console.log('item button mounted');

		if (!this.form || !this.button) {
			console.warn(
				'<item-button> must be inside a form and contain a <button>',
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

		if (!newVariantId || !quantity) {
			alert('Missing variant or quantity.');
			return;
		}

		this.button.disabled = true;
		this.button.textContent = 'Updating...';

		try {
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

customElements.define('item-button', ItemButton);
