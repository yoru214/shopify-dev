class ShopifySearchToggle extends HTMLElement {
	connectedCallback() {
		const openBtn = this.querySelector('#open');
		const closeBtn = this.querySelector('#close-button');
		const searchBtn = this.querySelector('#search-button');
		const overlay = this.querySelector('#overlay');
		const input = this.querySelector('input');
		const header = document.getElementById('site-header');

		const openOverlay = () => {
			if (header && overlay) {
				overlay.style.height = `${header.offsetHeight}px`;
			}
			overlay.classList.add(
				'opacity-100',
				'translate-y-0',
				'pointer-events-auto',
			);
			overlay.classList.remove(
				'opacity-0',
				'-translate-y-2',
				'pointer-events-none',
			);
			input?.focus();
		};

		const closeOverlay = () => {
			overlay.classList.add(
				'opacity-0',
				'-translate-y-2',
				'pointer-events-none',
			);
			overlay.classList.remove(
				'opacity-100',
				'translate-y-0',
				'pointer-events-auto',
			);
		};

		openBtn?.addEventListener('click', (e) => {
			e.stopPropagation();
			openOverlay();
		});

		closeBtn?.addEventListener('click', (e) => {
			e.stopPropagation();
			closeOverlay();
		});

		searchBtn?.addEventListener('click', () => {
			if (input?.value.trim()) {
				const query = encodeURIComponent(input.value.trim());
				window.location.href = `/search?q=${query}`;
			}
		});

		input?.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeOverlay();
			}
			if (e.key === 'Enter') {
				e.preventDefault(); // prevent form submit if wrapped in <form>
				if (input?.value.trim()) {
					const query = encodeURIComponent(input.value.trim());
					window.location.href = `/search?q=${query}`;
				}
			}
		});

		document.addEventListener('click', (e) => {
			if (!this.contains(e.target)) {
				closeOverlay();
			}
		});
	}
}

customElements.define('shopify-search-toggle', ShopifySearchToggle);
