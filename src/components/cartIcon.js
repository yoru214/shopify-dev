class CartIcon extends HTMLElement {
	connectedCallback() {
		this.initialize();
		this.bindEvents();
	}

	initialize() {
		this.countSpan = this.querySelector('.cart-count');
		this.loadCartCount();
	}
	bindEvents() {
		document.addEventListener(
			'cart:item:added',
			this.loadCartCount.bind(this),
		);
	}
	loadCartCount() {
		fetch('/cart.js')
			.then((res) => res.json())
			.then((cart) => {
				this.count = cart.item_count;
				this.renderCount(this.count);
			});
	}

	renderCount(count) {
		if (this.countSpan) {
			this.countSpan.textContent = count;
		} else if (count > 0) {
			// If span wasn't rendered initially (e.g. cart was empty), create it
			const badge = document.createElement('span');
			badge.className =
				'cart-count absolute -top-2 -right-2 bg-[var(--color-button)] text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none';
			badge.textContent = count;

			const link = this.querySelector('a');
			if (link) link.appendChild(badge);
			this.countSpan = badge;
		}
	}
}

customElements.define('cart-icon', CartIcon);
