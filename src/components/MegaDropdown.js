class MegaDropdown extends HTMLElement {
	connectedCallback() {
		this.button = this.querySelector('button');
		this.panel = this.querySelector('#panel');
		this.chevron = this.querySelector('#chevron');
		this.header = document.querySelector('header');

		this._onToggle = this.onToggle.bind(this);
		this._onDocumentClick = this.onDocumentClick.bind(this);

		this.button?.addEventListener('click', this._onToggle);
		document.addEventListener('click', this._onDocumentClick);
	}

	disconnectedCallback() {
		this.button?.removeEventListener('click', this._onToggle);
		document.removeEventListener('click', this._onDocumentClick);
	}

	onToggle(e) {
		e.stopPropagation();

		if (this.header && this.panel) {
			const height = this.header.offsetHeight;
			this.panel.style.top = `${height}px`;
		}

		this.panel?.classList.toggle('hidden');
		this.chevron?.classList.toggle('rotate-180');
	}

	onDocumentClick(e) {
		if (!this.contains(e.target)) {
			this.panel?.classList.add('hidden');
			this.chevron?.classList.remove('rotate-180');
		}
	}
}

customElements.define('mega-dropdown', MegaDropdown);
