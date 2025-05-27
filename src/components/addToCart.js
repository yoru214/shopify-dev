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
				const toastEl = document.querySelector('toast-notification');
				const title = data.product_title || 'Item';
				const quantityAdded = Number(formData.get('quantity')) || 1;

				toastEl?.showToast(
					`${quantityAdded} × ${data.product_title} was successfully added to cart`,
					3000,
				);
			})
			.catch((err) => {
				console.error('[AddToCart] Error:', err);
			})
			.finally(() => {
				button.disabled = false;
				button.classList.remove('opacity-50', 'cursor-not-allowed');
				button.innerHTML = originalText;
			});
	}
}

customElements.define('add-to-cart', AddToCart);
