class MobileSlideMenu extends HTMLElement {
	connectedCallback() {
		if (!this.initialize()) return;
		this.bindEvents();
	}

	disconnectedCallback() {
		if (this.toggle && this._onOpen) {
			this.toggle.removeEventListener('click', this._onOpen);
		}
		if (this.close && this._onClose) {
			this.close.removeEventListener('click', this._onClose);
		}
	}

	initialize() {
		this.toggle = this.querySelector('#menu-toggle');
		this.menu = this.querySelector('#mobile-menu');
		this.close = this.querySelector('#menu-close');

		if (!this.toggle || !this.menu || !this.close) {
			console.warn('MobileSlideMenu: Missing toggle/menu/close element.');
			return false;
		}
		return true;
	}

	bindEvents() {
		this._onOpen = this.openMenu.bind(this);
		this._onClose = this.closeMenu.bind(this);

		this.toggle.addEventListener('click', this._onOpen);
		this.close.addEventListener('click', this._onClose);
	}

	openMenu() {
		this.menu.classList.remove('translate-x-full');
		this.menu.classList.add('translate-x-0');
	}

	closeMenu() {
		this.menu.classList.add('translate-x-full');
		this.menu.classList.remove('translate-x-0');
	}
}

customElements.define('mobile-slide-menu', MobileSlideMenu);
