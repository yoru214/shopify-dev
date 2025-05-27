class AddToCart extends HTMLElement {
	connectedCallback() {
		this.inititalize();
		this.bindEvents();
	}

	inititalize() {
		this.form = this.closest('form');

		if (!this.form) {
			console.error(`[AddToCart] Could not find parent <form>`);
			return;
		}
	}

	bindEvents() {
		this.addEventListener('click', this.onAddToCartClick.bind(this));
	}

	onAddToCartClick(e) {
		const button = e.target.closest('button[type="submit"]');
		if (!button) return;

		e.preventDefault();

		// ✅ Disable the button & show loading state
		button.disabled = true;
		button.classList.add('opacity-50', 'cursor-not-allowed');
		const originalText = button.innerHTML;
		button.innerHTML = 'Adding...';

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
				this.dispatchEvent(
					new CustomEvent('cart:item:added', {
						bubbles: true,
						detail: { item: data },
					}),
				);
			})
			.catch((err) => {
				console.error('[AddToCart] Error:', err);
				alert('Failed to add to cart. Please try again.');
			})
			.finally(() => {
				button.disabled = false;
				button.classList.remove('opacity-50', 'cursor-not-allowed');
				button.innerHTML = originalText;
			});
	}
}

customElements.define('add-to-cart', AddToCart);
