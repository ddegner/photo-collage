import {
	collectMeasuredCandidates,
	getCollageItems,
	solveMeasuredHeight,
} from '../utils/height-solver';

const AUTO_CONTAINER_SELECTOR =
	'.wp-block-photo-collage-container[data-height-mode="auto"]';

const MIN_HEIGHT = 200;
const FAILSAFE_REVEAL_MS = 350;
const MOBILE_STACK_MEDIA_QUERY = '(max-width: 782px)';

// The closed-form solve is exact in one pass for parseable percentage
// slopes; the extra passes are a measured safety net for rotated or
// otherwise unmodelled children.
const AUTO_LAYOUT_MAX_ITERATIONS = 3;

const cleanupByContainer = new WeakMap();
const geometryByContainer = new WeakMap();

const getDirectItems = ( container ) => getCollageItems( container );

const getContainerWidth = ( container ) => {
	const rectWidth = container.getBoundingClientRect().width;
	if ( Number.isFinite( rectWidth ) && rectWidth > 0 ) {
		return rectWidth;
	}

	const offsetWidth = container.offsetWidth || container.clientWidth;
	if ( Number.isFinite( offsetWidth ) && offsetWidth > 0 ) {
		return offsetWidth;
	}

	return 0;
};

const toFiniteNumber = ( value ) => {
	const numeric =
		typeof value === 'number' ? value : Number.parseFloat( value || '' );
	return Number.isFinite( numeric ) ? numeric : null;
};

const parseConstraint = ( constraint ) => {
	if ( Array.isArray( constraint ) && constraint.length >= 2 ) {
		const a = toFiniteNumber( constraint[ 0 ] );
		const b = toFiniteNumber( constraint[ 1 ] );

		if ( Number.isFinite( a ) || Number.isFinite( b ) ) {
			return [ a || 0, b || 0 ];
		}

		return null;
	}

	if ( constraint && typeof constraint === 'object' ) {
		const a = toFiniteNumber( constraint.a );
		const b = toFiniteNumber( constraint.b );

		if ( Number.isFinite( a ) || Number.isFinite( b ) ) {
			return [ a || 0, b || 0 ];
		}
	}

	return null;
};

const getPrecomputedGeometry = ( container ) => {
	if ( geometryByContainer.has( container ) ) {
		return geometryByContainer.get( container );
	}

	const raw = container.dataset.pcGeometry;
	if ( typeof raw !== 'string' || raw.trim() === '' ) {
		geometryByContainer.set( container, null );
		return null;
	}

	let parsed;
	try {
		parsed = JSON.parse( raw );
	} catch {
		geometryByContainer.set( container, null );
		return null;
	}

	const minHeight = Math.max(
		MIN_HEIGHT,
		toFiniteNumber( parsed?.minHeight ) || MIN_HEIGHT
	);
	const constraints = Array.isArray( parsed?.constraints )
		? parsed.constraints
				.map( parseConstraint )
				.filter( ( constraint ) => Array.isArray( constraint ) )
		: [];

	const geometry =
		constraints.length > 0
			? {
					minHeight,
					constraints,
			  }
			: null;

	geometryByContainer.set( container, geometry );
	return geometry;
};

const solvePrecomputedHeight = ( container ) => {
	const geometry = getPrecomputedGeometry( container );
	if ( ! geometry ) {
		return null;
	}

	const containerWidth = getContainerWidth( container );
	if ( ! Number.isFinite( containerWidth ) || containerWidth <= 0 ) {
		return null;
	}

	let solvedHeight = Math.max( MIN_HEIGHT, geometry.minHeight || MIN_HEIGHT );

	geometry.constraints.forEach( ( [ a, b ] ) => {
		const candidate = a * containerWidth + b;
		if ( Number.isFinite( candidate ) && candidate > 0 ) {
			solvedHeight = Math.max( solvedHeight, candidate );
		}
	} );

	return Math.max( MIN_HEIGHT, Math.ceil( solvedHeight ) );
};

// Ancestor transforms scale bounding rectangles while offset metrics stay in
// layout pixels.
const getContainerScaleY = ( container ) => {
	const rectHeight = container.getBoundingClientRect().height;
	const layoutHeight = container.offsetHeight;

	return rectHeight > 0 && layoutHeight > 0 ? rectHeight / layoutHeight : 1;
};

const hasAbsoluteItems = ( items ) =>
	items.some(
		( item ) => window.getComputedStyle( item ).position === 'absolute'
	);

const isStackedOnMobile = ( container ) =>
	container.classList.contains( 'is-stack-on-mobile' ) &&
	window.matchMedia( MOBILE_STACK_MEDIA_QUERY ).matches;

const revealContainer = ( container ) => {
	container.style.removeProperty( 'visibility' );
	container.dataset.pcAutoState = 'ready';
};

const clearContainerHeight = ( container ) => {
	container.style.removeProperty( 'height' );
};

const applyAutoLayout = ( container ) => {
	if ( ! container || ! container.isConnected ) {
		return { mode: 'skip', height: null };
	}

	if (
		container.dataset.heightMode &&
		container.dataset.heightMode !== 'auto'
	) {
		clearContainerHeight( container );
		return { mode: 'skip', height: null };
	}

	if ( isStackedOnMobile( container ) ) {
		clearContainerHeight( container );
		return { mode: 'skip', height: null };
	}

	const items = getDirectItems( container );
	if ( items.length === 0 ) {
		clearContainerHeight( container );
		return { mode: 'skip', height: null };
	}

	if ( ! hasAbsoluteItems( items ) ) {
		clearContainerHeight( container );
		return { mode: 'skip', height: null };
	}

	// The server-precomputed constraint solve stays both the seed (applied
	// before the first measurement so images that have not loaded yet cannot
	// collapse the container) and the floor for the measured refinement.
	const precomputedHeight = solvePrecomputedHeight( container );
	const minResolvedHeight = Number.isFinite( precomputedHeight )
		? Math.max( MIN_HEIGHT, precomputedHeight )
		: MIN_HEIGHT;

	if ( Number.isFinite( precomputedHeight ) ) {
		container.style.height = `${ minResolvedHeight }px`;
	}

	let solvedHeight = null;

	for (
		let iteration = 0;
		iteration < AUTO_LAYOUT_MAX_ITERATIONS;
		iteration += 1
	) {
		const { candidates, currentHeight } = collectMeasuredCandidates(
			container,
			items,
			{ scaleY: getContainerScaleY( container ) }
		);
		const resolvedHeight = Math.max(
			minResolvedHeight,
			solveMeasuredHeight( {
				candidates,
				currentHeight,
				minHeight: MIN_HEIGHT,
			} )
		);

		if (
			solvedHeight !== null &&
			Math.abs( resolvedHeight - solvedHeight ) <= 1
		) {
			break;
		}

		container.style.height = `${ resolvedHeight }px`;
		solvedHeight = resolvedHeight;
	}

	return {
		mode: 'auto',
		height: Number.isFinite( solvedHeight ) ? solvedHeight : null,
	};
};

const attachAutoLayout = ( container ) => {
	if ( ! container || typeof window === 'undefined' ) {
		return () => {};
	}

	let frame = null;
	let resizeObserver;
	let mutationObserver;
	let failSafeTimer = null;
	let hasRevealed = false;

	const schedule = () => {
		if ( frame !== null ) {
			return;
		}

		frame = window.requestAnimationFrame( () => {
			frame = null;
			applyAutoLayout( container );

			if ( ! hasRevealed ) {
				revealContainer( container );
				hasRevealed = true;
			}
		} );
	};

	const reconnectResizeObserver = () => {
		if ( ! resizeObserver ) {
			return;
		}

		resizeObserver.disconnect();
		resizeObserver.observe( container );
		getDirectItems( container ).forEach( ( item ) => {
			resizeObserver.observe( item );
		} );
	};

	if ( typeof window.ResizeObserver === 'function' ) {
		resizeObserver = new window.ResizeObserver( () => {
			schedule();
		} );
		reconnectResizeObserver();
	}

	if ( typeof window.MutationObserver === 'function' ) {
		mutationObserver = new window.MutationObserver( ( records ) => {
			let reconnectObservers = false;
			let shouldMeasure = false;

			records.forEach( ( record ) => {
				if ( record.type === 'childList' ) {
					reconnectObservers = true;
					shouldMeasure = true;
					return;
				}

				if ( record.type === 'attributes' ) {
					if (
						record.target === container &&
						record.attributeName === 'data-pc-geometry'
					) {
						geometryByContainer.delete( container );
						shouldMeasure = true;
						return;
					}

					if ( record.target !== container ) {
						shouldMeasure = true;
					}
				}
			} );

			if ( reconnectObservers ) {
				reconnectResizeObserver();
			}

			if ( shouldMeasure ) {
				schedule();
			}
		} );

		mutationObserver.observe( container, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				'style',
				'src',
				'width',
				'height',
				'data-pc-geometry',
			],
		} );
	}

	const onLoad = ( event ) => {
		if ( event.target instanceof window.HTMLImageElement ) {
			schedule();
		}
	};

	const onWindowResize = () => {
		schedule();
	};

	const onMobileMediaChange = () => {
		schedule();
	};

	container.addEventListener( 'load', onLoad, true );
	window.addEventListener( 'resize', onWindowResize );

	const mobileMediaQuery = window.matchMedia( MOBILE_STACK_MEDIA_QUERY );
	if ( typeof mobileMediaQuery.addEventListener === 'function' ) {
		mobileMediaQuery.addEventListener( 'change', onMobileMediaChange );
	} else if ( typeof mobileMediaQuery.addListener === 'function' ) {
		mobileMediaQuery.addListener( onMobileMediaChange );
	}

	failSafeTimer = window.setTimeout( () => {
		if ( ! hasRevealed ) {
			revealContainer( container );
			hasRevealed = true;
		}
	}, FAILSAFE_REVEAL_MS );

	schedule();

	return () => {
		if ( frame !== null ) {
			window.cancelAnimationFrame( frame );
		}

		if ( failSafeTimer !== null ) {
			window.clearTimeout( failSafeTimer );
		}

		container.removeEventListener( 'load', onLoad, true );
		window.removeEventListener( 'resize', onWindowResize );

		if ( mobileMediaQuery ) {
			if ( typeof mobileMediaQuery.removeEventListener === 'function' ) {
				mobileMediaQuery.removeEventListener(
					'change',
					onMobileMediaChange
				);
			} else if (
				typeof mobileMediaQuery.removeListener === 'function'
			) {
				mobileMediaQuery.removeListener( onMobileMediaChange );
			}
		}

		if ( resizeObserver ) {
			resizeObserver.disconnect();
		}

		if ( mutationObserver ) {
			mutationObserver.disconnect();
		}

		geometryByContainer.delete( container );
	};
};

const attachContainer = ( container ) => {
	if ( cleanupByContainer.has( container ) ) {
		return;
	}

	const cleanup = attachAutoLayout( container );
	cleanupByContainer.set( container, cleanup );
};

const detachContainer = ( container ) => {
	const cleanup = cleanupByContainer.get( container );
	if ( ! cleanup ) {
		return;
	}

	cleanup();
	cleanupByContainer.delete( container );
};

const visitAutoContainers = ( node, callback ) => {
	if ( ! ( node instanceof window.Element ) ) {
		return;
	}

	if ( node.matches( AUTO_CONTAINER_SELECTOR ) ) {
		callback( node );
	}

	node.querySelectorAll( AUTO_CONTAINER_SELECTOR ).forEach( callback );
};

const init = () => {
	document
		.querySelectorAll( AUTO_CONTAINER_SELECTOR )
		.forEach( ( container ) => {
			attachContainer( container );
		} );

	if ( typeof window.MutationObserver === 'function' && document.body ) {
		new window.MutationObserver( ( records ) => {
			records.forEach( ( record ) => {
				record.addedNodes.forEach( ( node ) => {
					visitAutoContainers( node, attachContainer );
				} );

				record.removedNodes.forEach( ( node ) => {
					visitAutoContainers( node, detachContainer );
				} );
			} );
		} ).observe( document.body, {
			childList: true,
			subtree: true,
		} );
	}
};

if ( window.wp && typeof window.wp.domReady === 'function' ) {
	window.wp.domReady( init );
} else if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init, { once: true } );
} else {
	init();
}
