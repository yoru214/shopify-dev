import { HTMLElementMixin } from '../utils/htmlElementMixin.js';
import { ThemeEvent } from '../utils/themeEvent.js';

class DynamicSection extends HTMLElementMixin(HTMLElement) {
	constructor() {
		super();
		this.dynamic_url = this.getAttribute('data-dynamic-url') || null;
		this.section_id = this.getAttribute('data-section-id') || null;
		this.data_load_group =
			this.getAttribute('data-load-group') ||
			`group-${Math.random().toString(36).substring(2, 10)}`;
		this.load_blur = this.getAttribute('data-blur-duration') || 0;
	}

	connectedCallback() {
		this.bindEvents();
	}

	disconnectedCallback() {
		window.removeEventListener('popstate', this._onPopState);
		ThemeEvent.off(
			'dynamic:section:load:' + this.data_load_group,
			this._onContentLoad,
		);
	}

	bindEvents() {
		this._onPopState = this.onPopState.bind(this);
		window.addEventListener('popstate', this._onPopState);

		if (this.dynamic_url) {
			this._onContentLoad = this.onContentLoad.bind(this);
			ThemeEvent.on(
				'dynamic:section:load:' + this.data_load_group,
				this._onContentLoad,
			);
		}
	}

	onPopState(e) {
		const url = window.location.href;
		this.loadUrl(url);
	}

	onContentLoad(e) {
		const query = this.getQueryString();
		let url = `${this.dynamic_url}?section_id=${this.section_id}&${query}`;

		this.loadSection(url);
	}
	getQueryString() {
		const parts = [];

		for (const [key, value] of Object.entries(this.windowParams)) {
			if (Array.isArray(value)) {
				for (const v of value) {
					parts.push(
						`${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
					);
				}
			} else {
				parts.push(
					`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
				);
			}
		}

		return parts.join('&');
	}

	async loadSection(url) {
		if (this.load_blur > 0) {
			this.classList.add('blur-sm', 'pointer-events-none');
		}

		try {
			const res = await fetch(url);
			const html = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const bodyNodes = Array.from(doc.body.childNodes);

			if (this.load_blur > 0) {
				await new Promise((r) => setTimeout(r, this.load_blur));
			}

			this.replaceChildren(...bodyNodes);

			const offset = -350;
			const top =
				this.getBoundingClientRect().top + window.scrollY + offset;

			window.scrollTo({
				top,
				behavior: 'smooth',
			});
		} catch (err) {
			console.error('[DynamicSection] Failed to load section:', err);
		} finally {
			if (this.load_blur > 0) {
				this.classList.remove('blur-sm', 'pointer-events-none');
			}
		}
	}

	loadUrl(url, group = null) {
		window.history.pushState({}, '', url);
		let g = group;

		if (!g) {
			g = this.data_load_group;
		}

		ThemeEvent.emit('dynamic:section:load:' + g, { group: group });
	}
}

customElements.define('dynamic-section', DynamicSection);
