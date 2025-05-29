import { ThemeEvent } from '../utils/themeEvent.js';

class FacetFilter extends HTMLElement {
	connectedCallback() {
		this.form = this.querySelector('form');
		if (!this.form) return;
		this.section = this.closest('dynamic-section');

		this.form.addEventListener('submit', this.onSubmit.bind(this));
	}

	onSubmit(event) {
		event.preventDefault(); // prevent full page reload
		const formData = new FormData(this.form);
		const params = new URLSearchParams();
		// Handle multiple checkbox values per key
		for (const [key, value] of formData.entries()) {
			params.append(key, value);
		}
		const newUrl = `${window.location.pathname}?${params.toString()}`;
		this.section.loadUrl(newUrl);
	}
}

customElements.define('facet-filter', FacetFilter);
