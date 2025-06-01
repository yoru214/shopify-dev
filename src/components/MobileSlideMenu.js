class MobileSlideMenu extends HTMLElement {
	connectedCallback() {
		const toggle = this.querySelector('#menu-toggle');
		const menu = this.querySelector('#mobile-menu');
		const close = this.querySelector('#menu-close');

		if (!toggle || !menu || !close) {
			console.warn('MobileSlideMenu: Missing toggle/menu/close element.');
			return;
		}

		toggle.addEventListener('click', () => {
			menu.classList.remove('translate-x-full');
			menu.classList.add('translate-x-0');
		});

		close.addEventListener('click', () => {
			menu.classList.add('translate-x-full');
			menu.classList.remove('translate-x-0');
		});
	}
}

customElements.define('mobile-slide-menu', MobileSlideMenu);
