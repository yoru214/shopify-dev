import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

Swiper.use([Autoplay]);

class MediaViewer extends HTMLElement {
	constructor() {
		super();
		this.mainSwiper = null;
		this.thumbSwiper = null;
		this.productInfoEl = null;
	}

	connectedCallback() {
		const productInfoSelector = this.getAttribute('product-info');
		if (productInfoSelector) {
			this.productInfoEl = document.querySelector(productInfoSelector);
		}

		requestAnimationFrame(() => {
			if (this.initialize()) {
				this.loadEvents();
			}
		});
	}

	initialize() {
		const mainEl = this.querySelector('.main-swiper');
		const thumbEl = this.querySelector('.thumbs-swiper');

		if (!mainEl || !thumbEl) return false;

		const mainSlides = mainEl.querySelectorAll('.swiper-slide');
		const thumbSlides = thumbEl.querySelectorAll('.swiper-slide');

		if (mainSlides.length < 2 || thumbSlides.length < 2) return false;

		mainSlides.forEach((slide, index) => {
			slide.classList.add(`slide-display-counter-${index}`);
			slide.setAttribute('data-slide-index', index);
		});

		thumbSlides.forEach((slide, index) => {
			slide.classList.add(`slide-display-counter-${index}`);
			slide.setAttribute('data-slide-index', index);
		});

		this.thumbSwiper = new Swiper(thumbEl, {
			loop: false,
			slidesPerView: 'auto',
			spaceBetween: 4,
			freeMode: true,
			simulateTouch: false,
			allowTouchMove: false,
		});

		this.mainSwiper = new Swiper(mainEl, {
			loop: false,
			slidesPerView: 1,
			spaceBetween: 0,
			autoplay: false,
			simulateTouch: true,
			allowTouchMove: true,
		});
		this.updateThumbnailOverlays();

		return true;
	}

	loadEvents() {
		if (!this.mainSwiper || !this.thumbSwiper) return;

		this.mainSwiper.on('slideChangeTransitionStart', () => {
			const prevSlide =
				this.mainSwiper.slides[this.mainSwiper.previousIndex];
			if (prevSlide) {
				const focused = prevSlide.querySelector(':focus');
				if (focused) focused.blur();
			}
		});

		this.mainSwiper.on('slideChange', this.onSlideChange.bind(this));

		const productInfoSelector = this.getAttribute('product-info');
		if (productInfoSelector) {
			this.productInfoEl = document.querySelector(productInfoSelector);

			document.addEventListener('mediaViewerColorSelected', (e) => {
				this.scrollToSlideMatchingColor(e.detail.color);
			});
		}
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

		if (diff < 0) this.rotateThumbs('left');
		else if (diff > 0) this.rotateThumbs('right');
		else this.rotateThumbs('left');

		this.checkVariantMatch();
	}

	checkVariantMatch() {
		if (!this.productInfoEl || this._checkingVariantMatch) return;

		this._checkingVariantMatch = true;

		requestAnimationFrame(() => {
			const activeSlide =
				this.mainSwiper.slides[this.mainSwiper.activeIndex];
			const imgEl = activeSlide.querySelector('img');
			if (!imgEl) {
				this._checkingVariantMatch = false;
				return;
			}

			const imgPath = new URL(imgEl.src, location.origin).pathname;
			const variants = JSON.parse(
				this.productInfoEl.dataset.variants || '[]',
			);

			const matchedVariant = variants.find((variant) => {
				const variantPath = variant.featured_image?.src
					? new URL('https:' + variant.featured_image.src).pathname
					: null;
				return variantPath === imgPath;
			});

			if (matchedVariant?.option1) {
				document.dispatchEvent(
					new CustomEvent('mediaViewerImageSelected', {
						detail: { color: matchedVariant.option1 },
					}),
				);
			}

			this._checkingVariantMatch = false;
		});
	}

	dispatchColorChange(colorValue) {
		if (!this.productInfoEl) return;

		const event = new CustomEvent('mediaViewerColorSelected', {
			detail: { color: colorValue },
			bubbles: true,
			composed: true,
		});

		this.productInfoEl.dispatchEvent(event);
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

			thumbSlides = Array.from(wrapper.children);
			firstThumbIndex = thumbSlides[0]?.getAttribute('data-slide-index');
			if (++cnt > 10) break;
		}

		this.updateThumbnailOverlays();
	}

	updateThumbnailOverlays() {
		const thumbSlides =
			this.thumbSwiper?.el?.querySelectorAll('.swiper-slide') || [];

		thumbSlides.forEach((slide, index) => {
			const overlay = slide.querySelector('.overlay');
			if (!overlay) return;

			if (index === 0) {
				overlay.classList.add('hidden'); // no overlay on first
			} else {
				overlay.classList.remove('hidden'); // overlay on others
			}
		});
	}

	scrollToSlideMatchingColor(color) {
		if (this._isScrollingToSlide) return;

		this._isScrollingToSlide = true;

		const variants = JSON.parse(
			this.productInfoEl.dataset.variants || '[]',
		);
		const match = variants.find(
			(v) => v.option1 === color && v.featured_image?.src,
		);

		if (!match) {
			this._isScrollingToSlide = false;
			return;
		}

		const targetSrc = 'https:' + match.featured_image.src;
		const targetPath = new URL(targetSrc).pathname;

		let targetIndex = -1;
		this.mainSwiper.slides.forEach((slide, index) => {
			const img = slide.querySelector('img');
			const imgPath = img
				? new URL(img.src, location.origin).pathname
				: null;
			if (imgPath === targetPath) {
				targetIndex = index;
			}
		});

		const currentIndex = this.mainSwiper.realIndex;

		if (targetIndex !== -1 && targetIndex !== currentIndex) {
			this.mainSwiper.slideToLoop(targetIndex, 300);
			setTimeout(() => {
				this._isScrollingToSlide = false;
			}, 350); // wait for animation to end
		} else {
			this._isScrollingToSlide = false;
		}
	}
}

customElements.define('media-viewer', MediaViewer);
