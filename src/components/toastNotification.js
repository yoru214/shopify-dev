class ToastNotification extends HTMLElement {
	connectedCallback() {
		this.toast = this.querySelector('#toast');
		this.toastMsg = this.querySelector('#toast-message');

		if (!this.toast || !this.toastMsg) {
			console.warn('[ToastNotification] toast/message element missing');
			return;
		}
	}

	showToast(message, duration = 3000) {
		const toast = this.toast;
		const msg = this.toastMsg;

		if (!toast || !msg) return;

		msg.textContent = message;

		// Reset animation state
		toast.classList.remove('hidden');
		toast.classList.add('transition', 'duration-300', 'ease-out');

		// Force reflow to restart transition (important!)
		void toast.offsetWidth;

		toast.classList.remove('opacity-0', '-translate-y-8');
		toast.classList.add('opacity-100', 'translate-y-0');

		// Hide after duration
		setTimeout(() => {
			toast.classList.remove('opacity-100', 'translate-y-0');
			toast.classList.add('opacity-0', '-translate-y-8');
			setTimeout(() => {
				toast.classList.add('hidden');
			}, 300); // match duration
		}, duration);
	}
}

customElements.define('toast-notification', ToastNotification);
