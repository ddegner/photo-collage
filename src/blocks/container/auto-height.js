import {
	CANVAS_GEOMETRY_CHANGE_EVENT,
	CANVAS_INTERACTION_ATTRIBUTE,
} from '../utils/canvas-geometry';
import {
	MIN_AUTO_HEIGHT,
	collectMeasuredCandidates,
	getCollageItems,
	solveMeasuredHeight,
} from '../utils/height-solver';

const MOBILE_STACK_BREAKPOINT = 782;

// The closed-form solve is exact in one pass for parseable percentage
// slopes; the extra passes are a measured safety net for rotated or
// otherwise unmodelled children.
const DEFAULT_MAX_ITERATIONS = 3;

const hasAbsoluteChildren = ( items ) =>
	items.some(
		( item ) => window.getComputedStyle( item ).position === 'absolute'
	);

const isMobileStacked = ( container ) =>
	container.classList.contains( 'is-stack-on-mobile' ) &&
	window.matchMedia( `(max-width: ${ MOBILE_STACK_BREAKPOINT }px)` ).matches;

const hasAutoHeightMode = ( container ) =>
	! container.dataset.heightMode || container.dataset.heightMode === 'auto';

// The editor canvas can render zoomed; bounding rectangles are scaled while
// offset metrics stay in layout pixels.
const getContainerScaleY = ( container ) => {
	const rectHeight = container.getBoundingClientRect().height;
	const layoutHeight = container.offsetHeight;

	return rectHeight > 0 && layoutHeight > 0 ? rectHeight / layoutHeight : 1;
};

export const clearAutoHeight = ( container ) => {
	if ( ! container ) {
		return;
	}

	container.style.removeProperty( 'height' );
};

export const calculateAutoHeight = (
	container,
	{ minHeight = MIN_AUTO_HEIGHT, maxIterations = DEFAULT_MAX_ITERATIONS } = {}
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

	let appliedHeight = null;

	for ( let index = 0; index < maxIterations; index += 1 ) {
		const { candidates, currentHeight } = collectMeasuredCandidates(
			container,
			items,
			{ scaleY: getContainerScaleY( container ) }
		);
		const resolvedHeight = solveMeasuredHeight( {
			candidates,
			currentHeight,
			minHeight,
		} );

		if (
			appliedHeight !== null &&
			Math.abs( resolvedHeight - appliedHeight ) <= 1
		) {
			break;
		}

		container.style.height = `${ resolvedHeight }px`;
		appliedHeight = resolvedHeight;
	}

	return appliedHeight;
};

export const applyAutoHeight = ( container, options = {} ) => {
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

	const { watchMutations = true, watchResize = true } = options;

	let animationFrameId = null;
	let resizeObserver;
	let mutationObserver;

	const scheduleMeasure = () => {
		if (
			animationFrameId !== null ||
			container.hasAttribute( CANVAS_INTERACTION_ATTRIBUTE )
		) {
			return;
		}

		animationFrameId = window.requestAnimationFrame( () => {
			animationFrameId = null;
			if ( container.hasAttribute( CANVAS_INTERACTION_ATTRIBUTE ) ) {
				return;
			}
			applyAutoHeight( container, options );
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

	container.addEventListener( 'load', onCaptureLoad, true );
	container.addEventListener( CANVAS_GEOMETRY_CHANGE_EVENT, scheduleMeasure );
	if ( watchResize ) {
		window.addEventListener( 'resize', onWindowResize );
	}

	scheduleMeasure();

	return () => {
		if ( animationFrameId !== null ) {
			window.cancelAnimationFrame( animationFrameId );
		}
		container.removeEventListener( 'load', onCaptureLoad, true );
		container.removeEventListener(
			CANVAS_GEOMETRY_CHANGE_EVENT,
			scheduleMeasure
		);
		if ( watchResize ) {
			window.removeEventListener( 'resize', onWindowResize );
		}

		if ( resizeObserver ) {
			resizeObserver.disconnect();
		}

		if ( mutationObserver ) {
			mutationObserver.disconnect();
		}
	};
};
