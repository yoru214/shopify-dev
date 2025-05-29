import { ThemeEvent } from '../utils/themeEvent.js';

class ModalCloseButton extends HTMLElement {
	connectedCallback() {
		this.setAttribute('role', 'button');
		this.style.cursor = 'pointer';

		this.addEventListener('click', () => {
			const modal = this.closest('modal-viewer');
			if (modal && typeof modal.close === 'function') {
				modal.close();
			}
		});
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.close);
	}
}

customElements.define('modal-close-button', ModalCloseButton);

class ModalViewer extends HTMLElement {
	constructor() {
		super();
		this.backdrop = null;
		this.wrapper = null;
		this.slotEl = null;
		this._onEscape = this.onEscape.bind(this);
		this._onBackdropClick = this.onBackdropClick.bind(this);
		this._onCloseClick = this.onCloseClick.bind(this);
		this._onThemeEvent = this.onThemeEvent.bind(this);
	}

	connectedCallback() {
		this.backdrop = this.querySelector('modal-backdrop');
		this.wrapper = this.querySelector('modal-wrapper');
		this.slotEl = this.querySelector('[data-modal-slot]');

		if (!this.backdrop || !this.wrapper || !this.slotEl) {
			console.warn('[ModalViewer] Missing modal structure in markup.');
			return;
		}

		const closeBtn = this.wrapper.querySelector('modal-close-button');
		if (closeBtn) {
			closeBtn.addEventListener('click', this._onCloseClick);
		}

		this.backdrop.addEventListener('click', this._onBackdropClick);
		document.addEventListener('keydown', this._onEscape);

		ThemeEvent.on('modal:product:preview', this._onThemeEvent);
		ThemeEvent.on('modal:cart:item:edit', this._onThemeEvent);
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this._onEscape);
		this.backdrop.removeEventListener('click', this._onBackdropClick);

		const closeBtn = this.wrapper.querySelector('modal-close-button');
		if (closeBtn) {
			closeBtn.removeEventListener('click', this._onCloseClick);
		}

		ThemeEvent.off('modal:product:preview', this._onThemeEvent);
	}

	onEscape(e) {
		if (e.key === 'Escape') this.close();
	}

	onBackdropClick(e) {
		if (e.target === this.backdrop) this.close();
	}

	onCloseClick() {
		this.close();
	}

	async onThemeEvent({ detail }) {
		if (!detail?.url) return;

		try {
			const res = await fetch(detail.url);
			const html = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// If you want to insert the entire body content
			const bodyNodes = Array.from(doc.body.childNodes);

			if (bodyNodes.length && bodyNodes[0].nodeType === 1) {
				const url = new URL(detail.url, window.location.origin);
				const params = new URLSearchParams(url.search);

				// Convert all query params into data-* attributes
				for (const [key, value] of params.entries()) {
					const camelCaseKey = key.replace(/[-_](\w)/g, (_, c) =>
						c.toUpperCase(),
					);
					this.slotEl.dataset[camelCaseKey] = value;
				}
			}

			this.slotEl.replaceChildren(...bodyNodes);
			this.open();
		} catch (err) {
			console.error('[ModalViewer] Failed to load preview', err);
		}
	}

	open() {
		this.backdrop.classList.remove('hidden');
		this.backdrop.classList.add('flex');
	}

	close() {
		this.backdrop.classList.remove('flex');
		this.backdrop.classList.add('hidden');
		this.slotEl.replaceChildren();
	}
}

customElements.define('modal-viewer', ModalViewer);
