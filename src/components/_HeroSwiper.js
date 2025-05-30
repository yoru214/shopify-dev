import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

Swiper.use([Autoplay]);

class HeroSlider extends HTMLElement {
	connectedCallback() {
		this.mainSwiper = null;

		requestAnimationFrame(() => {
			if (!this.initialize()) return;
			this.bindEvents();
		});
	}

	disconnectedCallback() {
		this.unbindEvents();
	}

	initialize() {
		const mainEl = this.querySelector('.main-swiper');

		if (!mainEl || !(mainEl instanceof Element)) {
			console.error(
				'Swiper cannot initialize: .main-swiper not found or invalid.',
			);
			return false;
		}

		const mainSlides = mainEl.querySelectorAll('.swiper-slide');
		if (mainSlides.length < 2) {
			console.warn('Not enough slides to initialize Hero Swiper');
			return false;
		}

		this.mainSwiper = new Swiper(mainEl, {
			modules: [Autoplay],
			loop: true,
			slidesPerView: 1,
			spaceBetween: 0,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false,
			},
		});

		return true;
	}

	bindEvents() {
		if (!this.mainSwiper) return;

		this._onSlideChangeTransitionStart =
			this.onSlideChangeTransitionStart.bind(this);
		this.mainSwiper.on(
			'slideChangeTransitionStart',
			this._onSlideChangeTransitionStart,
		);
	}

	unbindEvents() {
		if (this.mainSwiper && this._onSlideChangeTransitionStart) {
			this.mainSwiper.off(
				'slideChangeTransitionStart',
				this._onSlideChangeTransitionStart,
			);
		}
	}

	onSlideChangeTransitionStart() {
		const prevSlide = this.mainSwiper.slides[this.mainSwiper.previousIndex];
		if (prevSlide) {
			const focused = prevSlide.querySelector(':focus');
			if (focused) {
				focused.blur();
			}
		}
	}
}

customElements.define('hero-swiper', HeroSlider);
