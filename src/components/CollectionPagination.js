class CollectionPagination extends HTMLElement {
	connectedCallback() {
		this.section = this.closest('dynamic-section');

		this.addEventListener('click', this._onClick.bind(this));
	}

	_onClick(event) {
		const link = event.target.closest('a');
		if (!link || !this.contains(link)) return;

		// Prevent normal navigation
		event.preventDefault();

		const url = link.getAttribute('href');
		if (!url) return;

		this.section.loadUrl(url);
	}
}

customElements.define('collection-pagination', CollectionPagination);
