class HeaderOffset extends HTMLElement {
	connectedCallback() {
		this.onResize();
		window.addEventListener('resize', this.onResize.bind(this));
	}

	onResize() {
		const header = document.getElementById('site-header');
		if (header) {
			const headerHeight = header.offsetHeight;
			this.style.paddingTop = `${headerHeight}px`;
		}
	}
}

customElements.define('header-offset', HeaderOffset);
