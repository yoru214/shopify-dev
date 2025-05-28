import { ThemeEvent } from '../utils/themeEvent.js';

class ProductQuantity extends HTMLElement {
	constructor() {
		super();
		this.input = null;
	}

	connectedCallback() {
		if (!this.closest('product-info')) {
			console.warn(
				'<product-quantity> can only be used inside <product-info>',
			);
			return;
		}

		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener('input', this._onInput);
	}

	render() {
		if (this.querySelector('input')) return;

		const input = document.createElement('input');
		input.type = 'number';

		input.setAttribute('id', 'product-quantity');

		this.min = this.getAttribute('min') || '1';
		input.setAttribute('min', this.min);

		const name = this.getAttribute('name') || 'quantity';
		input.setAttribute('name', name);

		const attributes = ['value', 'max', 'step', 'placeholder'];
		for (const attr of attributes) {
			if (this.hasAttribute(attr)) {
				input.setAttribute(attr, this.getAttribute(attr));
			}
		}

		input.className = this.getAttribute('class');
		this.removeAttribute('class');

		this._onInput = this.onInput.bind(this);
		input.addEventListener('input', this._onInput);

		this.appendChild(input);
		this.input = input;
	}

	onInput() {
		let val = parseInt(this.value, 10);
		if (isNaN(val) || val < parseInt(this.min)) {
			this.value = this.min;
		}
	}

	get value() {
		return this.input?.value;
	}

	set value(val) {
		if (this.input) {
			this.input.value = Math.max(parseInt(val, 10), 1);
		}
	}
}

class ProductInfo extends HTMLElement {
	connectedCallback() {
		requestAnimationFrame(() => {
			this.initialize();
			this.bindEvents();
			setTimeout(() => {
				this.updateVariant();
			}, 1000);
		});
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	initialize() {
		if (!customElements.get('product-quantity')) {
			customElements.define('product-quantity', ProductQuantity);
		}

		if (!customElements.get('purchase-actions')) {
			customElements.define(
				'purchase-actions',
				class extends HTMLElement {},
			);
		}

		if (!customElements.get('sold-out-message')) {
			customElements.define(
				'sold-out-message',
				class extends HTMLElement {},
			);
		}

		this.optionInputs = this.querySelectorAll(
			'input[type="radio"][name^="options["]',
		);
		this.variantInput = this.querySelector('input[name="id"]');
		this.variants = JSON.parse(this.dataset.variants || '[]');
		this.optionSpans = this.querySelectorAll('variant-button');
		this.regularEl = this.querySelector('regular-price');
		this.compareEl = this.querySelector('compare-at-price');
		this.badgeEl = this.querySelector('sale-badge');
		this.buyNowBtn = this.querySelector('[name="button"]');
		this.purchaseActions = this.querySelector('purchase-actions');
		this.soldOutMessage = this.querySelector('sold-out-message');
		this.quantityInput = this.querySelector('product-quantity');
	}

	bindEvents() {
		this._onOptionInputChange = this.onOptionInputChange.bind(this);
		this.optionInputs.forEach((input) => {
			input.addEventListener('change', this._onOptionInputChange);
		});

		this._onOptionSpanClick = this.onOptionSpanClick.bind(this);
		this.optionSpans.forEach((span) => {
			span.addEventListener('click', this._onOptionSpanClick);
		});

		this._onMediaViewerImageSelected =
			this.onMediaViewerImageSelected.bind(this);
		ThemeEvent.on(
			'product:media:selected',
			this._onMediaViewerImageSelected,
		);

		this._onCartItemAdded = this.onCartItemAdded.bind(this);
		ThemeEvent.on('cart:item:added', this._onCartItemAdded);
	}

	unbindEvents() {
		this.optionInputs.forEach((input) => {
			input.removeEventListener('change', this._onOptionInputChange);
		});

		this.optionSpans.forEach((span) => {
			span.removeEventListener('click', this._onOptionSpanClick);
		});

		ThemeEvent.off(
			'product:media:selected',
			this._onMediaViewerImageSelected,
		);

		ThemeEvent.off('cart:item:added', this._onCartItemAdded);
	}

	onOptionInputChange(e) {
		this.updateVariant();
	}

	onOptionSpanClick(e) {
		const span = e.currentTarget;
		const name = span.dataset.name;
		const value = span.dataset.value;

		const radio = this.querySelector(
			`input[type="radio"][name="${name}"][value="${value}"]`,
		);
		if (radio) {
			radio.checked = true;
			radio.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}

	onMediaViewerImageSelected(e) {
		const color = e.detail.color;

		const colorInputs = this.querySelectorAll(
			`input[name="options[Color]"]`,
		);

		colorInputs.forEach((input) => {
			if (input.value === color) {
				input.checked = true;
				input.dispatchEvent(new Event('change', { bubbles: true }));
			} else {
				input.checked = false;
			}
		});
	}

	onCartItemAdded(e) {
		if (this.quantityInput) {
			this.quantityInput.value = 1;
		}
	}

	formatMoney(cents) {
		const amount = (cents / 100).toFixed(2);
		return `₱${amount}`;
	}

	updateVariant() {
		const selectedOptions = [];

		const optionGroups = [...this.optionInputs].reduce((groups, input) => {
			const name = input.name;
			if (!groups[name]) groups[name] = [];
			groups[name].push(input);
			return groups;
		}, {});

		Object.values(optionGroups).forEach((inputs) => {
			inputs.forEach((input) => {
				const span = input.nextElementSibling;
				if (!span) return;

				// Update selected state
				if (input.checked) {
					selectedOptions.push(input.value);
					span.dataset.selected = 'true';
				} else {
					span.dataset.selected = 'false';
				}
			});
		});

		const matchedVariant = this.variants.find((v) => {
			return (
				JSON.stringify(v.options) === JSON.stringify(selectedOptions)
			);
		});

		if (matchedVariant) {
			this.variantInput.value = matchedVariant.id;

			const compareAt = matchedVariant.compare_at_price;
			const price = matchedVariant.price;

			this.regularEl.textContent = this.formatMoney(price);

			if (compareAt && compareAt > price) {
				this.compareEl.textContent = this.formatMoney(compareAt);
				this.compareEl.classList.remove('hidden');
			} else {
				this.compareEl.textContent = '';
				this.compareEl.classList.add('hidden');
			}

			if (matchedVariant.compare_at_price > matchedVariant.price) {
				this.badgeEl.classList.remove('hidden');
			} else {
				this.badgeEl.classList.add('hidden');
			}

			if (matchedVariant.available) {
				this.purchaseActions.classList.remove('hidden');
				this.soldOutMessage.classList.add('hidden');
				this.soldOutMessage.classList.remove('flex');
			} else {
				this.purchaseActions.classList.add('hidden');
				this.soldOutMessage.classList.remove('hidden');
				this.soldOutMessage.classList.add('flex');
			}

			ThemeEvent.emit('product:info:updated', {
				color: matchedVariant.option1,
			});
		}
		if (this.quantityInput) {
			const max = matchedVariant.inventory_quantity ?? 999;
			this.quantityInput.max = max;
			this.quantityInput.min = 1;

			// Clamp value to valid range
			let qty = parseInt(this.quantityInput.value, 10);
			if (isNaN(qty) || qty < 1) qty = 1;
			if (qty > max) qty = max;
			this.quantityInput.value = qty;
		}
	}
}

customElements.define('product-info', ProductInfo);
