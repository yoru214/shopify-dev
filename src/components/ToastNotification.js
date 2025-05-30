import { ThemeEvent } from '../utils/themeEvent.js';

class ToastNotification extends HTMLElement {
	connectedCallback() {
		if (!this.initialize()) return;
		this.bindEvents();
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	initialize() {
		this.template = this.querySelector('template');

		if (!this.template) {
			console.warn('[ToastNotification] Missing <template>');
			return false;
		}

		const testClone = this.template.content.cloneNode(true);
		const toast = testClone.querySelector('toast');
		const toastMsg = testClone.querySelector('toast-message');

		if (!toast || !toastMsg) {
			console.warn(
				'[ToastNotification] Template is missing <toast> or <toast-message>',
			);
			return false;
		}

		return true;
	}

	bindEvents() {
		this._onShowToast = this.onShowToast.bind(this);
		ThemeEvent.on('toast:show', this._onShowToast);
	}

	unbindEvents() {
		ThemeEvent.off('toast:show', this._onShowToast);
	}

	onShowToast({ detail }) {
		this.showToast(detail.message, detail.duration);
	}

	showToast(message, duration = 3000) {
		const template = this.querySelector('template');
		if (!template) {
			console.warn('[ToastNotification] Missing <template>');
			return;
		}

		// clone or copy the entire <toast> structure
		const clone = template.content.cloneNode(true);
		const toast = clone.querySelector('toast');
		const msg = clone.querySelector('toast-message');

		if (!toast || !msg) {
			console.warn(
				'[ToastNotification] Invalid toast template structure.',
			);
			return;
		}

		msg.textContent = message;
		this.appendChild(toast);

		// added animation
		requestAnimationFrame(() => {
			toast.classList.remove('opacity-0', '-translate-y-8');
			toast.classList.add('opacity-100', 'translate-y-0');
		});

		// remove animation
		setTimeout(() => {
			toast.classList.remove('opacity-100', 'translate-y-0');
			toast.classList.add('opacity-0', '-translate-y-8');
			setTimeout(() => toast.remove(), 300);
		}, duration);
	}
}

customElements.define('toast-notification', ToastNotification);
