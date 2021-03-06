export function ExpandingBox(element) {
	const
		once = {
			once: true
		},
		transitionEndExpanded = function(expandingBox) {
			expandingBox.element.style.height = 'auto';
		},
		transitionEndCollapsed = function(expandingBox) {
			expandingBox.element.setAttribute('data-expanded', false);
			expandingBox.expanded = false;
		}
	;
	this.element = element;
	this.expanded = element.getAttribute('data-expanded') === 'true';
	this.lockHeight = function() {
		const clientHeight = this.element.clientHeight;

		this.element.style.height = clientHeight + 'px';
		return clientHeight;
	};
	this.expand = function(resizeContent, callback) {
		const lockHeight = this.lockHeight();
		if (!this.expanded) {
			this.element.setAttribute('data-expanded', true);
			this.expanded = true;
		}
		if (resizeContent) {
			resizeContent(this);
		}
		window.requestAnimationFrame(
			// LockHeight gets painted here
			() => window.requestAnimationFrame(
				() => {
					const contentHeight = this.element.firstElementChild.clientHeight;
					if (lockHeight !== contentHeight) {
						this.element.style.height = contentHeight + 'px';
						this.element.addEventListener(
							'transitionend',
							() => {
								transitionEndExpanded(this);
								if (callback) {
									callback(this);
								}
							},
							once
						);
					} else {
						transitionEndExpanded(this);
					}
				}
			)
		);
	};
	this.collapse = function(callback) {
		if (this.expanded) {
			if (this.lockHeight() !== 0) {
				window.requestAnimationFrame(
					// LockHeight gets painted here
					() => window.requestAnimationFrame(
						() => {
							this.element.style.height = 0;
							this.element.addEventListener(
								'transitionend',
								() => {
									transitionEndCollapsed(this);
									if (callback) {
										callback(this);
									}
								},
								once
							);
						}
					)
				);
			} else {
				transitionEndCollapsed(this);
			}
		}
	};
}
