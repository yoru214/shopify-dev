import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

Swiper.use([Autoplay]);

class MediaViewer extends HTMLElement {
	connectedCallback() {
		this.mainSwiper = null;
		this.thumbSwiper = null;

		this.autoplayVideo = this.dataset.autoplayVideo === 'true';

		requestAnimationFrame(() => {
			// only load events if swiper is initialized
			if (this.initialize()) {
				this.loadEvents();
			}
		});
	}

	initialize() {
		const mainEl = this.querySelector('.main-swiper');
		const thumbEl = this.querySelector('.thumbs-swiper');

		const mainSlides = mainEl.querySelectorAll('.swiper-slide');
		const thumbSlides = thumbEl.querySelectorAll('.swiper-slide');
		// do not initialize if not enough slides
		if (mainSlides.length < 2 || thumbSlides.length < 2) {
			return false;
		}
		mainSlides.forEach((slide, index) => {
			slide.classList.add(`slide-display-counter-${index}`);
			slide.setAttribute('data-slide-index', index);
			slide.setAttribute('data-slide-index', index); // optional extra
		});

		thumbSlides.forEach((slide, index) => {
			slide.classList.add(`slide-display-counter-${index}`);
			slide.setAttribute('data-slide-index', index);
			slide.setAttribute('data-slide-index', index);
		});

		this.thumbSwiper = new Swiper(thumbEl, {
			loop: false,
			slidesPerView: 'auto',
			spaceBetween: 8,
			freeMode: true,
			simulateTouch: true,
			allowTouchMove: true,
		});

		this.mainSwiper = new Swiper(mainEl, {
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

	loadEvents() {
		if (!this.mainSwiper || !this.thumbSwiper) return;

		// 💡 Blur active element inside previous slide before transition
		this.mainSwiper.on('slideChangeTransitionStart', () => {
			const prevSlide =
				this.mainSwiper.slides[this.mainSwiper.previousIndex];
			if (prevSlide) {
				const focused = prevSlide.querySelector(':focus');
				if (focused) {
					focused.blur();
					console.log(
						'Blurred focused element inside previous slide:',
						focused,
					);
				}
			}
		});

		this.mainSwiper.on('slideChange', this.onSlideChange.bind(this));
	}

	onSlideChange() {
		const diff = this.mainSwiper.touches?.diff;

		const activeSlide = this.mainSwiper.slides[this.mainSwiper.activeIndex];
		const video = activeSlide.querySelector('video');

		if (video) {
			this.querySelectorAll('video').forEach((v) => {
				if (v !== video) v.pause();
			});

			this.mainSwiper.allowSlideNext = false;
			this.mainSwiper.allowSlidePrev = false;

			video.play();
			video.onended = () => {
				this.mainSwiper.allowSlideNext = true;
				this.mainSwiper.allowSlidePrev = true;
				this.mainSwiper.autoplay.start();
			};
		} else {
			this.mainSwiper.allowSlideNext = true;
			this.mainSwiper.allowSlidePrev = true;
		}

		if (diff < 0) {
			this.rotateThumbs('left');
		} else if (diff > 0) {
			this.rotateThumbs('right');
		} else {
			this.rotateThumbs('left');
		}
	}

	rotateThumbs(direction) {
		let cnt = 0;
		let wrapper = this.thumbSwiper.el.querySelector('.swiper-wrapper');
		let thumbSlides = Array.from(wrapper.children);

		let mainIndex =
			this.mainSwiper.slides[this.mainSwiper.activeIndex].getAttribute(
				'data-slide-index',
			);
		let firstThumbIndex = thumbSlides[0]?.getAttribute('data-slide-index');
		while (firstThumbIndex !== mainIndex) {
			if (direction === 'left') {
				const firstSlide = thumbSlides[0];
				if (firstSlide) {
					wrapper.appendChild(firstSlide);
					this.thumbSwiper.updateSlides();
					this.thumbSwiper.updateProgress();
					this.thumbSwiper.slideTo(0, 0);
				}
			} else if (direction === 'right') {
				const lastSlide = thumbSlides[thumbSlides.length - 1];
				if (lastSlide) {
					wrapper.prepend(lastSlide);
					this.thumbSwiper.updateSlides();
					this.thumbSwiper.updateProgress();
					this.thumbSwiper.slideTo(0, 0);
				}
			}

			// Refresh slide references
			thumbSlides = Array.from(wrapper.children);
			firstThumbIndex = thumbSlides[0]?.getAttribute('data-slide-index');

			if (++cnt > 10) break;
		}
	}
}

customElements.define('media-viewer', MediaViewer);
