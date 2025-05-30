import { ThemeEvent } from '../utils/themeEvent.js';

class CartIcon extends HTMLElement {
	connectedCallback() {
		if (!this.initialize()) return;
		this.bindEvents();
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	initialize() {
		this.countSpan = this.querySelector('cart-count');
		if (!this.countSpan) {
			console.error(`[CartIcon] Could not find child <cart-icon>`);
			return false;
		}
		this.loadCartCount();
		return true;
	}

	bindEvents() {
		this._loadCartCount = this.loadCartCount.bind(this);
		ThemeEvent.on('cart:item:added', this._loadCartCount);
		ThemeEvent.on('cart:item:updated', this._loadCartCount);
		ThemeEvent.on('cart:item:removed', this._loadCartCount);
	}

	unbindEvents() {
		ThemeEvent.off('cart:item:added', this._loadCartCount);
		ThemeEvent.off('cart:item:updated', this._loadCartCount);
		ThemeEvent.off('cart:item:removed', this._loadCartCount);
	}

	loadCartCount() {
		fetch('/cart.js')
			.then((res) => res.json())
			.then((cart) => {
				this.count = cart.item_count;
				this.renderCount(this.count);
			});
	}

	renderCount(count) {
		if (this.countSpan) {
			this.countSpan.textContent = count;

			if (count > 0) {
				this.countSpan.classList.remove('hidden');
			} else {
				this.countSpan.classList.add('hidden');
			}
		}
	}
}

customElements.define('cart-icon', CartIcon);
