const COLLAGE_ITEM_CLASS_NAMES = [
	'wp-block-photo-collage-image',
	'wp-block-photo-collage-frame',
];

const MOBILE_STACK_BREAKPOINT = 782;
const DEFAULT_MIN_HEIGHT = 200;
const DEFAULT_MAX_ITERATIONS = 8;
const DEFAULT_INITIAL_REVEAL_STABILITY_MS = 220;
const DEFAULT_INITIAL_REVEAL_TIMEOUT_MS = 1800;
const MAX_PERCENT_ANCHOR = 99.5;
const NO_TRANSITION_DATASET_KEY = 'photoCollageAutoHeightNoTransition';
const HIDDEN_UNTIL_LOCK_DATASET_KEY = 'photoCollageAutoHeightHiddenUntilLock';
const PREV_VISIBILITY_VALUE_DATASET_KEY =
	'photoCollageAutoHeightPrevVisibilityValue';
const PREV_VISIBILITY_PRIORITY_DATASET_KEY =
	'photoCollageAutoHeightPrevVisibilityPriority';
const INITIAL_HIDDEN_DATASET_KEY = 'autoHeightInitialHidden';

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

const getItemIntrinsicRatio = ( item ) => {
	const image = item.querySelector( 'img' );
	if ( ! image ) {
		return null;
	}

	const width =
		Number.parseFloat( image.getAttribute( 'width' ) || '' ) ||
		image.naturalWidth;
	const height =
		Number.parseFloat( image.getAttribute( 'height' ) || '' ) ||
		image.naturalHeight;

	if (
		! Number.isFinite( width ) ||
		width <= 0 ||
		! Number.isFinite( height ) ||
		height <= 0
	) {
		return null;
	}

	return height / width;
};

const getItemCaptionHeight = ( item ) => {
	const captionNodes = Array.from(
		item.querySelectorAll(
			'.photo-collage-image-caption, .wp-element-caption'
		)
	);
	if ( captionNodes.length === 0 ) {
		return 0;
	}

	const uniqueNodes = captionNodes.filter(
		( node, index ) => captionNodes.indexOf( node ) === index
	);

	return uniqueNodes.reduce( ( total, node ) => {
		const captionRect = node.getBoundingClientRect();
		if ( Number.isFinite( captionRect.height ) && captionRect.height > 0 ) {
			return total + captionRect.height;
		}

		return total;
	}, 0 );
};

const getItemWidthInPixels = ( item, containerWidth ) => {
	const widthPercent = parsePercentValue( item.style.width );
	if ( widthPercent !== null && Number.isFinite( containerWidth ) ) {
		return ( containerWidth * widthPercent ) / 100;
	}

	const widthPixels = parsePixelValue( item.style.width );
	if ( widthPixels !== null ) {
		return widthPixels;
	}

	const measuredWidth =
		item.getBoundingClientRect().width || item.offsetWidth;
	if ( Number.isFinite( measuredWidth ) && measuredWidth > 0 ) {
		return measuredWidth;
	}

	return null;
};

const getItemEstimatedHeight = ( item, containerWidth ) => {
	const styleHeightPixels = parsePixelValue( item.style.height );
	if ( styleHeightPixels !== null ) {
		return styleHeightPixels;
	}

	const itemWidth = getItemWidthInPixels( item, containerWidth );
	const intrinsicRatio = getItemIntrinsicRatio( item );
	const captionHeight = getItemCaptionHeight( item );
	const itemStyles = window.getComputedStyle( item );
	const itemVerticalInsets =
		Number.parseFloat( itemStyles.paddingTop || '0' ) +
		Number.parseFloat( itemStyles.paddingBottom || '0' ) +
		Number.parseFloat( itemStyles.borderTopWidth || '0' ) +
		Number.parseFloat( itemStyles.borderBottomWidth || '0' );

	if (
		Number.isFinite( itemWidth ) &&
		itemWidth > 0 &&
		Number.isFinite( intrinsicRatio ) &&
		intrinsicRatio > 0
	) {
		return itemWidth * intrinsicRatio + captionHeight + itemVerticalInsets;
	}

	const measuredHeight =
		item.getBoundingClientRect().height || item.offsetHeight || 0;
	if ( Number.isFinite( measuredHeight ) && measuredHeight > 0 ) {
		return measuredHeight;
	}

	return null;
};

const getItemRequiredContainerHeight = ( item, itemHeight, measuredBottom ) => {
	if ( ! Number.isFinite( itemHeight ) || itemHeight <= 0 ) {
		return Number.isFinite( measuredBottom ) && measuredBottom > 0
			? measuredBottom
			: null;
	}

	const topPercent = parsePercentValue( item.style.top );
	if ( topPercent !== null && topPercent < MAX_PERCENT_ANCHOR ) {
		return itemHeight / ( 1 - topPercent / 100 );
	}

	const topPixels = parsePixelValue( item.style.top );
	if ( topPixels !== null ) {
		return topPixels + itemHeight;
	}

	const bottomPercent = parsePercentValue( item.style.bottom );
	if ( bottomPercent !== null && bottomPercent < MAX_PERCENT_ANCHOR ) {
		return itemHeight / ( 1 - bottomPercent / 100 );
	}

	const bottomPixels = parsePixelValue( item.style.bottom );
	if ( bottomPixels !== null ) {
		return bottomPixels + itemHeight;
	}

	return Number.isFinite( measuredBottom ) && measuredBottom > 0
		? measuredBottom
		: null;
};

const disableAutoHeightTransition = ( container ) => {
	if ( ! container ) {
		return;
	}

	container.style.setProperty( 'transition', 'none', 'important' );
	container.dataset[ NO_TRANSITION_DATASET_KEY ] = '1';
};

const restoreAutoHeightTransition = ( container ) => {
	if (
		! container ||
		container.dataset[ NO_TRANSITION_DATASET_KEY ] !== '1'
	) {
		return;
	}

	container.style.removeProperty( 'transition' );
	delete container.dataset[ NO_TRANSITION_DATASET_KEY ];
};

const hideAutoHeightContainer = ( container ) => {
	if (
		! container ||
		container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ] === '1'
	) {
		return;
	}

	if ( container.dataset[ INITIAL_HIDDEN_DATASET_KEY ] === '1' ) {
		container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ] = '1';
		return;
	}

	container.dataset[ PREV_VISIBILITY_VALUE_DATASET_KEY ] =
		container.style.getPropertyValue( 'visibility' );
	container.dataset[ PREV_VISIBILITY_PRIORITY_DATASET_KEY ] =
		container.style.getPropertyPriority( 'visibility' );
	container.style.setProperty( 'visibility', 'hidden' );
	container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ] = '1';
};

const revealAutoHeightContainer = ( container ) => {
	if (
		! container ||
		container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ] !== '1'
	) {
		return;
	}

	if ( container.dataset[ INITIAL_HIDDEN_DATASET_KEY ] === '1' ) {
		container.style.removeProperty( 'visibility' );
		delete container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ];
		delete container.dataset[ INITIAL_HIDDEN_DATASET_KEY ];
		delete container.dataset[ PREV_VISIBILITY_VALUE_DATASET_KEY ];
		delete container.dataset[ PREV_VISIBILITY_PRIORITY_DATASET_KEY ];
		return;
	}

	const previousValue =
		container.dataset[ PREV_VISIBILITY_VALUE_DATASET_KEY ] || '';
	const previousPriority =
		container.dataset[ PREV_VISIBILITY_PRIORITY_DATASET_KEY ] || '';

	if ( previousValue ) {
		container.style.setProperty(
			'visibility',
			previousValue,
			previousPriority
		);
	} else {
		container.style.removeProperty( 'visibility' );
	}

	delete container.dataset[ HIDDEN_UNTIL_LOCK_DATASET_KEY ];
	delete container.dataset[ PREV_VISIBILITY_VALUE_DATASET_KEY ];
	delete container.dataset[ PREV_VISIBILITY_PRIORITY_DATASET_KEY ];
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
	const containerWidth =
		containerRect.width ||
		container.offsetWidth ||
		container.clientWidth ||
		0;
	const currentHeight = Math.max(
		minHeight,
		containerRect.height || container.offsetHeight || minHeight
	);
	let estimatedHeight = currentHeight;

	items.forEach( ( item ) => {
		const itemRect = item.getBoundingClientRect();
		const measuredBottom = itemRect.bottom - containerRect.top;
		const itemHeight = getItemEstimatedHeight( item, containerWidth );
		const requiredHeight = getItemRequiredContainerHeight(
			item,
			itemHeight,
			measuredBottom
		);

		if ( Number.isFinite( requiredHeight ) && requiredHeight > 0 ) {
			estimatedHeight = Math.max( estimatedHeight, requiredHeight );
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
		hideUntilFirstMeasure = false,
		initialRevealStabilityMs = DEFAULT_INITIAL_REVEAL_STABILITY_MS,
		initialRevealTimeoutMs = DEFAULT_INITIAL_REVEAL_TIMEOUT_MS,
	} = options;

	let animationFrameId = null;
	let resizeObserver;
	let mutationObserver;
	let hasLockedInitialHeight = false;
	let initialRevealTimerId = null;
	let initialRevealFallbackTimerId = null;

	const emitResolvedHeight = ( resolvedHeight ) => {
		if (
			typeof onHeightResolved !== 'function' ||
			! Number.isFinite( resolvedHeight ) ||
			resolvedHeight <= 0
		) {
			return;
		}

		const containerWidth = container.getBoundingClientRect().width;
		if ( Number.isFinite( containerWidth ) && containerWidth > 0 ) {
			onHeightResolved( {
				height: resolvedHeight,
				width: containerWidth,
			} );
		}
	};

	const finalizeInitialLock = () => {
		if ( hasLockedInitialHeight ) {
			return;
		}

		hasLockedInitialHeight = true;
		if ( initialRevealTimerId !== null ) {
			window.clearTimeout( initialRevealTimerId );
			initialRevealTimerId = null;
		}
		if ( initialRevealFallbackTimerId !== null ) {
			window.clearTimeout( initialRevealFallbackTimerId );
			initialRevealFallbackTimerId = null;
		}
		revealAutoHeightContainer( container );
	};

	const queueInitialReveal = () => {
		if ( hasLockedInitialHeight ) {
			return;
		}

		if ( initialRevealTimerId !== null ) {
			window.clearTimeout( initialRevealTimerId );
		}

		initialRevealTimerId = window.setTimeout(
			() => {
				initialRevealTimerId = null;
				finalizeInitialLock();
			},
			Math.max( 0, initialRevealStabilityMs )
		);
	};

	const hasIncompleteImages = () =>
		getCollageItems( container ).some( ( item ) =>
			Array.from( item.querySelectorAll( 'img' ) ).some(
				( image ) => ! image.complete
			)
		);

	if ( hideUntilFirstMeasure ) {
		hideAutoHeightContainer( container );
		initialRevealFallbackTimerId = window.setTimeout(
			() => {
				initialRevealFallbackTimerId = null;
				finalizeInitialLock();
			},
			Math.max( 0, initialRevealTimeoutMs )
		);
	}

	const scheduleMeasure = () => {
		if ( animationFrameId !== null ) {
			return;
		}

		animationFrameId = window.requestAnimationFrame( () => {
			animationFrameId = null;
			const resolvedHeight = applyAutoHeight( container, options );
			if ( hideUntilFirstMeasure ) {
				queueInitialReveal();
			} else {
				finalizeInitialLock();
			}
			emitResolvedHeight( resolvedHeight );
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
		if ( hideUntilFirstMeasure ) {
			queueInitialReveal();
		} else {
			finalizeInitialLock();
		}
		emitResolvedHeight( initialHeight );
		scheduleMeasure();
	}

	return () => {
		if ( animationFrameId !== null ) {
			window.cancelAnimationFrame( animationFrameId );
		}
		if ( initialRevealTimerId !== null ) {
			window.clearTimeout( initialRevealTimerId );
		}
		if ( initialRevealFallbackTimerId !== null ) {
			window.clearTimeout( initialRevealFallbackTimerId );
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

		revealAutoHeightContainer( container );
		restoreAutoHeightTransition( container );
	};
};
