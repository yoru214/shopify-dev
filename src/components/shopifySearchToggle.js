class ShopifySearchToggle extends HTMLElement {
	connectedCallback() {
		this.initialize();
		this.bindEvents();
	}

	initialize() {
		this.openBtn = this.querySelector('#open');
		this.closeBtn = this.querySelector('#close-button');
		this.searchBtn = this.querySelector('#search-button');
		this.overlay = this.querySelector('#overlay');
		this.input = this.querySelector('input');
		this.header = document.getElementById('site-header');
	}

	bindEvents() {
		this.openBtn?.addEventListener('click', this.onClickSearch.bind(this));
		this.closeBtn?.addEventListener('click', this.onClickClose.bind(this));
		this.searchBtn?.addEventListener(
			'click',
			this.onClickSearchButton.bind(this),
		);
		this.input?.addEventListener(
			'keydown',
			this.onKeyDownSearch.bind(this),
		);
		document?.addEventListener('click', this.onCLickOutside.bind(this));
	}

	onClickSearch(e) {
		e.stopPropagation();
		this.openOverlay();
	}

	onClickClose(e) {
		e.stopPropagation();
		this.closeOverlay();
	}

	onClickSearchButton(e) {
		if (this.input?.value.trim()) {
			const query = encodeURIComponent(this.input.value.trim());
			window.location.href = `/search?q=${query}`;
		}
	}
	onKeyDownSearch(e) {
		if (e.key === 'Escape') {
			this.closeOverlay();
		}
		if (e.key === 'Enter') {
			e.preventDefault(); // prevent form submit if wrapped in <form>
			if (this.input?.value.trim()) {
				const query = encodeURIComponent(this.input.value.trim());
				window.location.href = `/search?q=${query}`;
			}
		}
	}

	onCLickOutside(e) {
		if (!this.contains(e.target)) {
			this.closeOverlay();
		}
	}

	openOverlay() {
		if (this.header && this.overlay) {
			this.overlay.style.height = `${this.header.offsetHeight}px`;
		}
		this.overlay.classList.add(
			'opacity-100',
			'translate-y-0',
			'pointer-events-auto',
		);
		this.overlay.classList.remove(
			'opacity-0',
			'-translate-y-2',
			'pointer-events-none',
		);
		this.input?.focus();
	}

	closeOverlay() {
		this.overlay.classList.add(
			'opacity-0',
			'-translate-y-2',
			'pointer-events-none',
		);
		this.overlay.classList.remove(
			'opacity-100',
			'translate-y-0',
			'pointer-events-auto',
		);
	}
}

customElements.define('shopify-search-toggle', ShopifySearchToggle);
