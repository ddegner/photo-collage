const COLLAGE_ITEM_CLASS_NAMES = [
	'wp-block-photo-collage-image',
	'wp-block-photo-collage-frame',
];

const MOBILE_STACK_BREAKPOINT = 782;
const DEFAULT_MIN_HEIGHT = 200;
const DEFAULT_MAX_ITERATIONS = 8;
const MAX_PERCENT_ANCHOR = 99.5;

const COLLAGE_ITEM_SELECTOR = COLLAGE_ITEM_CLASS_NAMES.map(
	( className ) => `.${ className }`
).join( ', ' );

const getCollageItems = ( container ) =>
	Array.from( container.querySelectorAll( COLLAGE_ITEM_SELECTOR ) ).filter(
		( item ) => {
			// Keep only items that belong to this container and are not nested
			// inside another collage item.
			if (
				item.closest( '.wp-block-photo-collage-container' ) !==
				container
			) {
				return false;
			}

			const parentCollageItem = item.parentElement?.closest(
				COLLAGE_ITEM_SELECTOR
			);
			return ! parentCollageItem;
		}
	);

const hasAbsoluteChildren = ( items ) =>
	items.some(
		( item ) => window.getComputedStyle( item ).position === 'absolute'
	);

const isMobileStacked = ( container ) =>
	container.classList.contains( 'is-stack-on-mobile' ) &&
	window.matchMedia( `(max-width: ${ MOBILE_STACK_BREAKPOINT }px)` ).matches;

const hasAutoHeightMode = ( container ) =>
	! container.dataset.heightMode || container.dataset.heightMode === 'auto';

const parsePercentValue = ( value ) => {
	if ( typeof value !== 'string' ) {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	if ( ! normalized.endsWith( '%' ) ) {
		return null;
	}

	const numericValue = Number.parseFloat(
		normalized.slice( 0, normalized.length - 1 )
	);
	if ( ! Number.isFinite( numericValue ) ) {
		return null;
	}

	return numericValue;
};

const parsePixelValue = ( value ) => {
	if ( typeof value !== 'string' ) {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	if ( ! normalized.endsWith( 'px' ) ) {
		return null;
	}

	const numericValue = Number.parseFloat(
		normalized.slice( 0, normalized.length - 2 )
	);
	if ( ! Number.isFinite( numericValue ) ) {
		return null;
	}

	return numericValue;
};

const disableAutoHeightTransition = ( container ) => {
	if ( ! container ) {
		return;
	}

	container.style.setProperty( 'transition', 'none', 'important' );
	container.dataset.photoCollageAutoHeightNoTransition = '1';
};

const restoreAutoHeightTransition = ( container ) => {
	if (
		! container ||
		container.dataset.photoCollageAutoHeightNoTransition !== '1'
	) {
		return;
	}

	container.style.removeProperty( 'transition' );
	delete container.dataset.photoCollageAutoHeightNoTransition;
};

const getMeasuredBottom = ( container, items ) => {
	const containerRect = container.getBoundingClientRect();
	let maxBottom = 0;

	items.forEach( ( item ) => {
		const itemRect = item.getBoundingClientRect();
		maxBottom = Math.max( maxBottom, itemRect.bottom - containerRect.top );
	} );

	return maxBottom;
};

export const clearAutoHeight = ( container ) => {
	if ( ! container ) {
		return;
	}

	container.style.removeProperty( 'height' );
	restoreAutoHeightTransition( container );
};

const getEstimatedAutoHeight = ( container, items, minHeight ) => {
	const containerRect = container.getBoundingClientRect();
	const currentHeight = Math.max(
		minHeight,
		containerRect.height || container.offsetHeight || minHeight
	);
	let estimatedHeight = currentHeight;

	items.forEach( ( item ) => {
		const itemRect = item.getBoundingClientRect();
		const itemHeight = itemRect.height || item.offsetHeight || 0;
		if ( ! Number.isFinite( itemHeight ) || itemHeight <= 0 ) {
			return;
		}

		const topPercent = parsePercentValue( item.style.top );
		if ( topPercent !== null && topPercent < MAX_PERCENT_ANCHOR ) {
			const estimatedFromTop = itemHeight / ( 1 - topPercent / 100 );
			if ( Number.isFinite( estimatedFromTop ) ) {
				estimatedHeight = Math.max( estimatedHeight, estimatedFromTop );
				return;
			}
		}

		const topPixels = parsePixelValue( item.style.top );
		if ( topPixels !== null ) {
			estimatedHeight = Math.max(
				estimatedHeight,
				topPixels + itemHeight
			);
			return;
		}

		const bottomPercent = parsePercentValue( item.style.bottom );
		if ( bottomPercent !== null && bottomPercent < MAX_PERCENT_ANCHOR ) {
			const estimatedFromBottom =
				itemHeight / ( 1 - bottomPercent / 100 );
			if ( Number.isFinite( estimatedFromBottom ) ) {
				estimatedHeight = Math.max(
					estimatedHeight,
					estimatedFromBottom
				);
				return;
			}
		}

		const measuredBottom = itemRect.bottom - containerRect.top;
		if ( Number.isFinite( measuredBottom ) ) {
			estimatedHeight = Math.max( estimatedHeight, measuredBottom );
		}
	} );

	return Math.max( minHeight, Math.ceil( estimatedHeight ) );
};

export const calculateAutoHeight = (
	container,
	{
		minHeight = DEFAULT_MIN_HEIGHT,
		maxIterations = DEFAULT_MAX_ITERATIONS,
	} = {}
) => {
	if (
		! container ||
		! container.isConnected ||
		! hasAutoHeightMode( container )
	) {
		return null;
	}

	const items = getCollageItems( container );
	if (
		items.length === 0 ||
		! hasAbsoluteChildren( items ) ||
		isMobileStacked( container )
	) {
		return null;
	}

	let nextHeight = getEstimatedAutoHeight( container, items, minHeight );

	for ( let index = 0; index < maxIterations; index += 1 ) {
		const roundedHeight = Math.ceil( nextHeight );
		container.style.height = `${ roundedHeight }px`;

		const measuredBottom = getMeasuredBottom( container, items );
		const resolvedHeight = Math.max(
			minHeight,
			Math.ceil( measuredBottom )
		);

		if ( Math.abs( resolvedHeight - roundedHeight ) <= 1 ) {
			nextHeight = resolvedHeight;
			break;
		}

		nextHeight = resolvedHeight;
	}

	return Math.max( minHeight, Math.ceil( nextHeight ) );
};

export const applyAutoHeight = ( container, options = {} ) => {
	disableAutoHeightTransition( container );
	const resolvedHeight = calculateAutoHeight( container, options );

	if ( ! resolvedHeight ) {
		clearAutoHeight( container );
		return null;
	}

	container.style.height = `${ resolvedHeight }px`;
	return resolvedHeight;
};

export const attachAutoHeight = ( container, options = {} ) => {
	if ( ! container || typeof window === 'undefined' ) {
		return () => {};
	}

	disableAutoHeightTransition( container );

	const {
		watchMutations = true,
		watchResize = true,
		onHeightResolved,
		measureOnInit = true,
	} = options;

	let animationFrameId = null;
	let resizeObserver;
	let mutationObserver;

	const hasIncompleteImages = () =>
		getCollageItems( container ).some( ( item ) =>
			Array.from( item.querySelectorAll( 'img' ) ).some(
				( image ) => ! image.complete
			)
		);

	const scheduleMeasure = () => {
		if ( animationFrameId !== null ) {
			return;
		}

		animationFrameId = window.requestAnimationFrame( () => {
			animationFrameId = null;
			const resolvedHeight = applyAutoHeight( container, options );

			if (
				typeof onHeightResolved === 'function' &&
				Number.isFinite( resolvedHeight ) &&
				resolvedHeight > 0
			) {
				const containerWidth = container.getBoundingClientRect().width;
				if ( Number.isFinite( containerWidth ) && containerWidth > 0 ) {
					onHeightResolved( {
						height: resolvedHeight,
						width: containerWidth,
					} );
				}
			}
		} );
	};

	const observeCurrentItems = () => {
		if ( ! resizeObserver ) {
			return;
		}

		resizeObserver.disconnect();
		resizeObserver.observe( container );
		getCollageItems( container ).forEach( ( item ) =>
			resizeObserver.observe( item )
		);
	};

	if ( watchResize && typeof window.ResizeObserver === 'function' ) {
		resizeObserver = new window.ResizeObserver( () => {
			scheduleMeasure();
		} );
		observeCurrentItems();
	}

	if ( watchMutations && typeof window.MutationObserver === 'function' ) {
		mutationObserver = new window.MutationObserver( ( mutations ) => {
			let needsReobserve = false;
			let needsMeasure = false;

			mutations.forEach( ( mutation ) => {
				if ( mutation.type === 'childList' ) {
					needsReobserve = true;
					needsMeasure = true;
					return;
				}

				if (
					mutation.type === 'attributes' &&
					mutation.target !== container
				) {
					needsMeasure = true;
				}
			} );

			if ( needsReobserve ) {
				observeCurrentItems();
			}

			if ( needsMeasure ) {
				scheduleMeasure();
			}
		} );

		mutationObserver.observe( container, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'style', 'class', 'src' ],
		} );
	}

	const onCaptureLoad = ( event ) => {
		if ( event.target instanceof window.HTMLImageElement ) {
			scheduleMeasure();
		}
	};

	const onWindowResize = () => {
		scheduleMeasure();
	};

	const onWindowLoad = () => {
		scheduleMeasure();
	};

	container.addEventListener( 'load', onCaptureLoad, true );
	if ( watchResize ) {
		window.addEventListener( 'resize', onWindowResize );
	}
	window.addEventListener( 'load', onWindowLoad, { once: true } );

	if ( measureOnInit || ! hasIncompleteImages() ) {
		const initialHeight = applyAutoHeight( container, options );
		if (
			typeof onHeightResolved === 'function' &&
			Number.isFinite( initialHeight ) &&
			initialHeight > 0
		) {
			const containerWidth = container.getBoundingClientRect().width;
			if ( Number.isFinite( containerWidth ) && containerWidth > 0 ) {
				onHeightResolved( {
					height: initialHeight,
					width: containerWidth,
				} );
			}
		}
		scheduleMeasure();
	}

	return () => {
		if ( animationFrameId !== null ) {
			window.cancelAnimationFrame( animationFrameId );
		}
		container.removeEventListener( 'load', onCaptureLoad, true );
		window.removeEventListener( 'load', onWindowLoad );
		if ( watchResize ) {
			window.removeEventListener( 'resize', onWindowResize );
		}

		if ( resizeObserver ) {
			resizeObserver.disconnect();
		}

		if ( mutationObserver ) {
			mutationObserver.disconnect();
		}

		restoreAutoHeightTransition( container );
	};
};
