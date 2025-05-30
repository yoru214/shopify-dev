import { DSHTMLElementMixin } from '../utils/dsHTMLElementMixin.js';

class FacetFilter extends DSHTMLElementMixin(HTMLElement) {
	constructor() {
		super();
		this._onFilterClick = this.onFilterClick.bind(this);
		this._filters = [];
	}
	connectedCallback() {
		super.connectedCallback();
		this.form = this.querySelector('form');
		if (!this.form) return;
		this.bindEvents();
		this._filters.forEach((filter) => {
			const input = filter
				.closest('label')
				?.querySelector('input[type="checkbox"]');
			if (input?.checked) {
				filter.classList.toggle('bg-button', true);
				filter.classList.toggle('text-button-label', true);
			}
		});
		this.setDefaultPriceRange();
	}

	disconnectedCallback() {
		this.removeEventListener('click', this._onSubmit);
		this.removeEventListener('click', this._onFilterClick);
	}

	bindEvents() {
		this._onSubmit = this.onSubmit.bind(this);
		this.form.addEventListener('submit', this._onSubmit);
		this._filters = Array.from(this.querySelectorAll('filter-button'));
		this._filters.forEach((filter) => {
			filter.addEventListener('click', this._onFilterClick);
		});
	}

	onSubmit(event) {
		event.preventDefault();
		const formData = new FormData(this.form);
		const params = new URLSearchParams();
		let hasSearch = false;
		for (const [key, value] of formData.entries()) {
			params.append(key, value);
			if (key == 'q') {
				hasSearch = true;
			}
		}
		let search = '';
		if (!hasSearch && this.windowParams.q) {
			search = `&q=${Array.isArray(this.windowParams.q) ? this.windowParams.q[0] : this.windowParams.q}`;
		}
		const newUrl = `${window.location.pathname}?${params.toString()}${search}`;
		this.dynamicSection.loadUrl(newUrl);
	}
	onFilterClick(e) {
		const button = e.currentTarget;
		const wrapper = button.closest('label');
		const input = wrapper?.querySelector('input[type="checkbox"]');

		if (!input || input.disabled) return;

		button.classList.toggle('bg-button', !input.checked);
		button.classList.toggle('text-button-label', !input.checked);
	}

	setDefaultPriceRange() {
		const priceAttr = this.getAttribute('data-prices');
		if (!priceAttr) return;

		const prices = priceAttr
			.split(',')
			.map((p) => parseInt(p, 10))
			.filter((p) => !isNaN(p));

		if (!prices.length) return;

		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);

		const minInput = this.querySelector(
			'input[name^="filter.v.price.gte"]',
		);
		const maxInput = this.querySelector(
			'input[name^="filter.v.price.lte"]',
		);

		if (minInput && (!minInput.value || parseFloat(minInput.value) === 0)) {
			minInput.value = Math.ceil(minPrice / 100).toFixed(0);
			minInput.setAttribute('min', Math.ceil(minPrice / 100).toFixed(2));
		}

		if (maxInput && (!maxInput.value || parseFloat(maxInput.value) === 0)) {
			maxInput.value = Math.ceil(maxPrice / 100).toFixed(0);
			maxInput.setAttribute('max', Math.ceil(maxPrice / 100).toFixed(0));
		}
	}
}

customElements.define('facet-filter', FacetFilter);
