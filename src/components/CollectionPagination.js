import { DSHTMLElementMixin } from '../utils/dsHTMLElementMixin.js';

class CollectionPagination extends DSHTMLElementMixin(HTMLElement) {
	connectedCallback() {
		super.connectedCallback();
		this._onButtonClick = this.onButtonClick.bind(this);
		this.addEventListener('click', this._onButtonClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this._onButtonClick);
	}

	onButtonClick(event) {
		const link = event.target.closest('a');
		if (!link || !this.contains(link)) return;

		event.preventDefault();

		const url = link.getAttribute('href');
		if (!url) return;

		this.dynamicSection.loadUrl(url);
	}
}

customElements.define('collection-pagination', CollectionPagination);
