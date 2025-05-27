class ProductInfo extends HTMLElement {
	connectedCallback() {
		this.initialize();
		this.bindEvents();
		this.updateVariant();
	}

	initialize() {
		this.optionInputs = this.querySelectorAll(
			'input[type="radio"][name^="options["]',
		);
		this.variantInput = this.querySelector('input[name="id"]');
		this.variants = JSON.parse(this.dataset.variants || '[]');
		this.optionSpans = this.querySelectorAll('.variant-button');
		this.compareEl = this.querySelector('#compareAtPrice');
		this.badgeEl = this.querySelector('#saleBadge');
		this.addToCartBtn = this.querySelector('#addToCartBtn');
		this.buyNowBtn = this.querySelector('[name="button"]');
		this.purchaseActions = this.querySelector('#purchaseActions');
		this.soldOutMessage = this.querySelector('#soldOutMessage');
		this.quantityInput = this.querySelector('#quantity');
	}

	bindEvents() {
		this.optionInputs.forEach((input) => {
			input.addEventListener(
				'change',
				this.onOptionInputChange.bind(this),
			);
		});
		this.optionSpans.forEach((span) => {
			span.addEventListener('click', this.onOptionSpanClick.bind(this));
		});

		this.addEventListener(
			'mediaViewerColorSelected',
			this.onMediaViewerColorSelected.bind(this),
		);

		document.addEventListener(
			'mediaViewerImageSelected',
			this.onMediaViewerImageSelected.bind(this),
		);

		document.addEventListener(
			'cart:item:added',
			this.onCartItemAdded.bind(this),
		);
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

	onMediaViewerColorSelected(e) {
		const color = e.detail.color;
		const colorInputs = this.querySelectorAll(
			`input[name="options[Color]"]`,
		);
		colorInputs.forEach((input) => {
			if (input.value === color) {
				input.checked = true;
				input.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});
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
				purchaseActions.classList.remove('hidden');
				if (this.addToCartBtn) this.addToCartBtn.disabled = false;
				if (this.buyNowBtn) this.buyNowBtn.disabled = false;
				this.soldOutMessage.classList.add('hidden');
				this.soldOutMessage.classList.remove('flex');
			} else {
				purchaseActions.classList.add('hidden');
				this.soldOutMessage.classList.remove('hidden');
				this.soldOutMessage.classList.add('flex');
			}

			document.dispatchEvent(
				new CustomEvent('mediaViewerColorSelected', {
					detail: { color: matchedVariant.option1 },
				}),
			);
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
