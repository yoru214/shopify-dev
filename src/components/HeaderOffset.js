class HeaderOffset extends HTMLElement {
	connectedCallback() {
		if (!this.initialize()) return;
		this.bindEvents();
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	initialize() {
		const header = document.querySelector('header');

		if (!header) {
			console.warn(
				'[HeaderOffset] <header> element not found. Padding will not be applied.',
			);
			return false;
		}

		this.header = header; // Store it for reuse in onResize()
		this.onResize();

		return true;
	}

	bindEvents() {
		this._onResize = this.onResize.bind(this);
		window.addEventListener('resize', this._onResize);
	}

	unbindEvents() {
		this.removeEventListener('resize', this._onResize);
	}

	onResize() {
		if (!this.header) return; // Safety check

		const headerHeight = this.header.offsetHeight;
		this.style.paddingTop = `${headerHeight}px`;
	}
}

customElements.define('header-offset', HeaderOffset);
