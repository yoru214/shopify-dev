class MegaDropdown extends HTMLElement {
	connectedCallback() {
		const button = this.querySelector('button');
		const panel = this.querySelector('#panel');
		const chevron = this.querySelector('#chevron');
		const header = document.querySelector('header');

		button?.addEventListener('click', (e) => {
			e.stopPropagation();

			// Dynamically calculate header height
			if (header && panel) {
				const height = header.offsetHeight;
				panel.style.top = `${height}px`;
			}

			panel.classList.toggle('hidden');
			chevron.classList.toggle('rotate-180');
		});

		document.addEventListener('click', (e) => {
			if (!this.contains(e.target)) {
				panel.classList.add('hidden');
				chevron.classList.remove('rotate-180');
			}
		});
	}
}

customElements.define('mega-dropdown', MegaDropdown);
