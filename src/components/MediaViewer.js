import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { ThemeEvent } from '../utils/themeEvent.js';

Swiper.use([Autoplay]);

class MediaViewer extends HTMLElement {
	constructor() {
		super();
		this.mainSwiper = null;
		this.thumbSwiper = null;
		this.variants = [];
		this._checkingVariantMatch = false;
		this._isScrollingToSlide = false;
	}

	connectedCallback() {
		this.blur();
		requestAnimationFrame(() => {
			if (!this.initialize()) return;
			this.bindEvents();
			setTimeout(() => {
				this.unblur();
			}, 100);
		});
	}

	disconnectedCallback() {
		this.unbindEvents();
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

		try {
			const variantsRaw = this.dataset.variants || '[]';
			this.variants = JSON.parse(variantsRaw);
		} catch (err) {
			console.warn('[MediaViewer] Invalid or missing data-variants.');
			this.variants = [];
		}

		this.updateThumbnailOverlays();
		return true;
	}

	bindEvents() {
		console.log('events bound');
		if (!this.mainSwiper || !this.thumbSwiper) return;

		this._onSlideChange = this.onSlideChange.bind(this);
		this.mainSwiper.on('slideChange', this._onSlideChange);

		this._onProductInfoUpdated = (e) => {
			this.scrollToSlideMatchingColor(e.detail.color);
		};
		ThemeEvent.on('product:info:updated', this._onProductInfoUpdated);

		this._onThumbClick = (e) => {
			const slide = e.currentTarget;
			const index = parseInt(slide.dataset.slideIndex, 10);

			if (!isNaN(index)) {
				this.mainSwiper.slideTo(index);
			}
		};
		this._onProductVariantScroll = (e) => {
			const variantId = e.detail.variant_id;
			console.log('is loaded?');
			if (!variantId) return;

			this.scrollToSlideByVariantId(variantId);
		};

		ThemeEvent.on(
			'product:media:scrollToVariant',
			this._onProductVariantScroll,
		);

		this.thumbSwiper.slides.forEach((slide) => {
			slide.classList.add('cursor-pointer');
			slide.addEventListener('click', this._onThumbClick);
		});
	}

	unbindEvents() {
		this.mainSwiper.off('slideChange', this._onSlideChange);
		ThemeEvent.off('product:info:updated', this.__onProductInfoUpdated);
		ThemeEvent.off(
			'product:media:scrollToVariant',
			this._onProductVariantScroll,
		);
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
		if (!this.variants.length || this._checkingVariantMatch) return;

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

			const matchedVariant = this.variants.find((variant) => {
				const variantPath = variant.featured_image?.src
					? new URL('https:' + variant.featured_image.src).pathname
					: null;
				return variantPath === imgPath;
			});

			if (matchedVariant?.option1) {
				ThemeEvent.emit('product:media:selected', {
					color: matchedVariant.option1,
				});
			}

			this._checkingVariantMatch = false;
		});
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
				overlay.classList.add('hidden');
			} else {
				overlay.classList.remove('hidden');
			}
		});
	}

	scrollToSlideMatchingColor(color) {
		if (this._isScrollingToSlide || !this.variants.length) return;

		this._isScrollingToSlide = true;

		// Find variant matching the color that has a featured image
		const match = this.variants.find(
			(v) => v.option1 === color && v.featured_image?.src,
		);

		if (!match) {
			this._isScrollingToSlide = false;
			return;
		}
		const targetSrc = 'https:' + match.featured_image.src;
		const targetPath = new URL(targetSrc).pathname;

		// Loop through Swiper slides to find the index with matching image
		let targetIndex = -1;

		this.mainSwiper.slides.forEach((slide, index) => {
			const img = slide.querySelector('img');
			const imgPath = img
				? new URL(img.src, location.origin).pathname
				: null;

			if (imgPath === targetPath && targetIndex === -1) {
				targetIndex = index;
			}
		});

		const currentIndex = this.mainSwiper.realIndex;

		// Scroll if found and not already there
		if (targetIndex !== -1 && targetIndex !== currentIndex) {
			const isLooping = this.mainSwiper.params.loop;

			if (isLooping) {
				// Use slideToLoop with the real index (from original non-duplicate slides)
				const originalSlides = this.mainSwiper.slides.filter(
					(slide) =>
						!slide.classList.contains('swiper-slide-duplicate'),
				);

				const realIndex = originalSlides.findIndex((slide) => {
					const img = slide.querySelector('img');
					const imgPath = img
						? new URL(img.src, location.origin).pathname
						: null;
					return imgPath === targetPath;
				});

				if (realIndex !== -1) {
					this.mainSwiper.slideToLoop(realIndex, 300);
				}
			} else {
				// If not looping, just slide to the index
				this.mainSwiper.slideTo(targetIndex, 300);
			}
		}

		setTimeout(() => {
			this._isScrollingToSlide = false;
		}, 350);
	}
	scrollToSlideByVariantId(variantId) {
		console.log('scrool:', variantId);
		if (this._isScrollingToSlide || !this.variants.length) return;

		this._isScrollingToSlide = true;

		const match = this.variants.find(
			(v) => Number(v.id) === Number(variantId) && v.featured_image?.src,
		);

		if (!match) {
			console.warn('[MediaViewer] No variant found for ID:', variantId);
			this._isScrollingToSlide = false;
			return;
		}

		const targetSrc = 'https:' + match.featured_image.src;
		const targetPath = new URL(targetSrc.split('?')[0], location.origin)
			.pathname;

		let targetIndex = -1;

		this.mainSwiper.slides.forEach((slide, index) => {
			const img = slide.querySelector('img');
			if (!img) return;

			const slideSrc = img.getAttribute('src') || img.src;
			const slidePath = new URL(slideSrc.split('?')[0], location.origin)
				.pathname;

			if (slidePath === targetPath && targetIndex === -1) {
				targetIndex = index;
			}
		});

		if (targetIndex !== -1) {
			this.mainSwiper.slideTo(
				(targetIndex + 1) % this.mainSwiper.slides.length,
				0,
			);
			setTimeout(() => {
				this.mainSwiper.slideTo(targetIndex, 300);
				this._isScrollingToSlide = false;
			}, 20);
		} else {
			console.warn('[MediaViewer] No matching slide for variant image.');
			this._isScrollingToSlide = false;
		}
	}

	blur() {
		this.classList.add('blur-3xl', 'transition');
	}
	unblur() {
		this.classList.remove('blur-3xl');
	}
}

customElements.define('media-viewer', MediaViewer);
