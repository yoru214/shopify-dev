export const HTMLElementMixin = (Base) =>
	class extends Base {
		get windowParams() {
			return this._windowParams || {};
		}

		connectedCallback() {
			if (super.connectedCallback) super.connectedCallback();

			this._updateWindowParams();

			this._onPopState = () => {
				console.log('mixin updated');
				this._updateWindowParams();
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

		_updateWindowParams() {
			const params = new URLSearchParams(window.location.search);
			const result = {};

			for (const [key, value] of params.entries()) {
				const camelKey = key.replace(/[-_](\w)/g, (_, c) =>
					c.toUpperCase(),
				);

				if (result.hasOwnProperty(camelKey)) {
					// If already exists, convert to array (or add to existing array)
					if (Array.isArray(result[camelKey])) {
						result[camelKey].push(value);
					} else {
						result[camelKey] = [result[camelKey], value];
					}
				} else {
					result[camelKey] = value;
				}
			}

			this._windowParams = result;
		}
	};
