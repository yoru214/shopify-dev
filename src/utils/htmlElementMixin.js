export const HTMLElementMixin = (Base) =>
	class extends Base {
		get windowParams() {
			const params = new URLSearchParams(window.location.search);
			const result = {};

			for (const [key, value] of params.entries()) {
				const camelKey = key.replace(/[-_](\w)/g, (_, c) =>
					c.toUpperCase(),
				);

				if (result.hasOwnProperty(camelKey)) {
					if (Array.isArray(result[camelKey])) {
						result[camelKey].push(value);
					} else {
						result[camelKey] = [result[camelKey], value];
					}
				} else {
					result[camelKey] = value;
				}
			}

			return result;
		}

		connectedCallback() {
			if (super.connectedCallback) super.connectedCallback();

			this._onPopState = () => {
				console.log('mixin popstate triggered');
				if (typeof this.onWindowParamsChanged === 'function') {
					this.onWindowParamsChanged(this.windowParams);
				}
			};

			window.addEventListener('popstate', this._onPopState);
		}

		disconnectedCallback() {
			if (super.disconnectedCallback) super.disconnectedCallback();
			window.removeEventListener('popstate', this._onPopState);
		}
	};
